"""Ebook Service Module"""

import logging
from io import BytesIO
from datetime import datetime
from django.db import transaction
from collections import OrderedDict
from django.utils import timezone
from rest_framework.response import Response
from rest_framework import status


from school.models import (
    SchoolDefaultClasses,
    Chapter,
    Prerequisite,
    SubTopic,
    SchoolBoard,
    SchoolDefaultSubjects,
    SchoolSyllabusEbooks,
    SchoolBoardMapping
)
from syllabus.models import SchoolChapter,SchoolSubTopic, SchoolPrerequisite
from classes.models import SchoolClass
from core import s3_client
from core.lang_chain.lang_chain import LangChainService

logger = logging.getLogger(__name__)


class EbookService:
    """Service class to handle eBook operations."""

    def upload_ebook(self, request):
        """Upload an eBook to S3."""
        try:
            file = request.FILES.get('file')
            upload_type = request.data.get('upload_type')
            board_id = request.data.get('board_id')
            class_id = request.data.get('class_id')
            subject_id = request.data.get('subject_id')
            chapter_number = request.data.get('chapter_number')
            syllabus_year = request.data.get('year')

            if not file:
                logger.error("No file provided for upload.")
                return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)
            if not upload_type or not board_id or not class_id or not subject_id or not syllabus_year:
                logger.error("Missing required fields for eBook upload.")
                return Response({"error": "Missing required fields."},
                                status=status.HTTP_400_BAD_REQUEST)
            
            if upload_type not in ['single', 'chapter_wise']:
                logger.error("Invalid upload type provided.")
                return Response({"error": "Invalid upload type."},
                                status=status.HTTP_400_BAD_REQUEST)

            class_obj = SchoolDefaultClasses.objects.get(id=class_id)
            board_obj = SchoolBoard.objects.get(id=board_id)
            subject_obj = SchoolDefaultSubjects.objects.get(id=subject_id)

            upload_type_check = "single"
            if upload_type == 'single':
                upload_type_check = "chapter_wise"
            ebook_available_status = SchoolSyllabusEbooks.objects.filter(
                board=board_obj,
                subject=subject_obj,
                class_number=class_obj,
                ebook_type=upload_type_check,
                syllabus_year=syllabus_year,
            ).exists()
            if ebook_available_status:
                logger.error("Ebook with upload type: %s exists for the given board, class, and subject.", upload_type_check)
                return Response({"error": f"Ebook with upload type: {upload_type_check} exists for the given board, class, and subject. Please delete the existing ebook before uploading a new one."},
                                status=status.HTTP_400_BAD_REQUEST)

            if upload_type == 'chapter_wise':
                if not chapter_number:
                    logger.error("Chapter number is required for chapter-wise upload.")
                    return Response({"error": "Chapter number is required."},
                                    status=status.HTTP_400_BAD_REQUEST)
                file_name = f"{subject_obj.name}_chapter_{chapter_number}_{timezone.now().strftime('%Y%m%d%H%M%S')}"
                s3_key = f"ebooks/class_{class_obj.class_number}/{board_obj.board_name.replace(' ', '_')}/{subject_obj.name}/{file_name}"
            else:
                file_name = f"{subject_obj.name}_{timezone.now().strftime('%Y%m%d%H%M%S')}"
                s3_key = f"ebooks/class_{class_obj.class_number}/{board_obj.board_name.replace(' ', '_')}/{file_name}"

            file_type = 'application/pdf'
            file_bytes = file.read()
            upload_success = s3_client.upload_file(BytesIO(file_bytes), f"{s3_key}.pdf", file_type=file_type)
            if upload_success:
                with transaction.atomic():
                    filters = {
                        'ebook__board': board_obj,
                        'ebook__subject': subject_obj,
                        'ebook__class_number': class_obj
                    }
                    if upload_type == 'chapter_wise':
                        filters['ebook__ebook_type'] = upload_type
                        filters['chapter_number'] = chapter_number
                    previously_uploaded_ebook = Chapter.objects.filter(
                        **filters
                    ).order_by('-ebook__created_at','-ebook__id').first()
                    if previously_uploaded_ebook:
                        previously_uploaded_ebook_id = previously_uploaded_ebook.ebook_id
                    else:
                        previously_uploaded_ebook_id = None

                    ebook = SchoolSyllabusEbooks.objects.create(
                        board=board_obj,
                        subject=subject_obj,
                        class_number=class_obj,
                        ebook_type=upload_type,
                        ebook_name=file_name,
                        file_path=s3_key,
                        syllabus_year=syllabus_year
                    )
                    if upload_type == 'chapter_wise':
                        ebook.chapter_number = int(chapter_number)
                        ebook.save()
                    extract_status, pdf_text = self.extract_topics_and_prerequisites(BytesIO(file_bytes), ebook,
                                                          previously_uploaded_ebook_id)
                    pdf_text_file = BytesIO()
                    pdf_text_file.write(pdf_text.encode("utf-8"))
                    pdf_text_file.seek(0)
                    text_file_upload_status = s3_client.upload_file(pdf_text_file, f"{s3_key}.txt", file_type='text/plain')
                    if not text_file_upload_status:
                        logger.error("Failed to upload extracted text file to S3.")
                    logger.info("Uploaded extracted text file to S3 successfully.")
                    logger.info("eBook uploaded successfully with ID: %s", ebook.id)
                return Response({"message": "eBook uploaded successfully"},
                                status=status.HTTP_201_CREATED)
            else:
                return Response({"error": "Failed to upload eBook."},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ValueError as ve:
            logger.error(f"ValueError: {ve}")
            return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except SchoolBoard.DoesNotExist:
            logger.error(f"Board with ID {board_id} does not exist.")
            return Response({"error": "Board not found."}, status=status.HTTP_404_NOT_FOUND)
        except SchoolDefaultClasses.DoesNotExist:
            logger.error(f"Class with ID {class_id} does not exist.")
            return Response({"error": "Class not found."}, status=status.HTTP_404_NOT_FOUND)
        except SchoolDefaultSubjects.DoesNotExist:
            logger.error(f"Subject with ID {subject_id} does not exist.")
            return Response({"error": "Subject not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(f"Error uploading eBook: {e}")
            return Response({"error": "An error occurred while uploading the eBook."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_ebook(self, request):
        """Retrieve eBook details with latest version logic for both 'single' and 'chapter_wise'."""
        try:
            board_id = request.GET.get("board_id")
            class_id = request.GET.get("class_id")
            subject_id = request.GET.get("subject_id")
            year = request.GET.get("year", datetime.today().year)
            page = int(request.GET.get("page", 1))

            if not year:
                logger.error("Syllabus year is required.")
                return Response({"error": "Syllabus year is required."},
                                status=status.HTTP_400_BAD_REQUEST)

            page_size = 12
            filter_conditions = {}

            if board_id:
                board = SchoolBoard.objects.get(id=board_id)
                filter_conditions['board'] = board
            if class_id:
                class_obj = SchoolDefaultClasses.objects.get(id=class_id)
                filter_conditions['class_number'] = class_obj
            if subject_id:
                subject = SchoolDefaultSubjects.objects.filter(id=subject_id)
            else:
                subject = SchoolDefaultSubjects.objects.all()
            filter_conditions['subject__in'] = subject
            filter_conditions['syllabus_year__lte'] = year
            filter_conditions['is_active'] = True

            base_queryset = SchoolSyllabusEbooks.objects.filter(**filter_conditions)

            # --- SINGLE TYPE ---

            all_single = base_queryset.filter(
                ebook_type='single',
                syllabus_year__lte=year
            ).order_by('-syllabus_year', '-created_at')

            unique_single = OrderedDict()
            for ebook in all_single:
                key = (ebook.board_id, ebook.class_number_id, ebook.subject_id)
                if key not in unique_single:
                    unique_single[key] = ebook

            latest_single_ebooks = list(unique_single.values())

            # --- CHAPTER-WISE TYPE FIXED ---

            all_chapterwise = base_queryset.filter(
                ebook_type='chapter_wise',
                syllabus_year__lte=year,
                chapter_number__isnull=False
            ).order_by('-syllabus_year', '-created_at')

            unique_chapterwise = OrderedDict()
            for ebook in all_chapterwise:
                key = (ebook.board_id, ebook.class_number_id, ebook.subject_id, ebook.chapter_number)
                if key not in unique_chapterwise:
                    unique_chapterwise[key] = ebook

            latest_chapterwise_ebooks = list(unique_chapterwise.values())

            # Combine and paginate
            combined_ebooks = list(latest_single_ebooks) + latest_chapterwise_ebooks
            combined_ebooks.sort(key=lambda x: x.id)
            ebooks = combined_ebooks[(page - 1) * page_size: page * page_size]

            if combined_ebooks and not ebooks:
                return Response({"message": "End of ebooks.", 'data': []}, status=status.HTTP_200_OK)
            if not ebooks:
                return Response({"error": "No eBooks found for the given criteria."},
                                status=status.HTTP_404_NOT_FOUND)

            ebook_list = []
            for ebook in ebooks:
                ebook_list.append({
                    "id": ebook.id,
                    "file_path": s3_client.generate_temp_link(f"{ebook.file_path}.pdf"),
                    "board": ebook.board.board_name,
                    "subject_name": ebook.subject.name,
                    "class_number": ebook.class_number.class_number,
                    "ebook_name": ebook.ebook_name,
                    "ebook_type": ebook.ebook_type,
                    "chapter_number": ebook.chapter_number,
                    "uploaded_at": ebook.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                })

            logger.info("Retrieved Ebooks Successfully.")
            return Response({'data': ebook_list}, status=status.HTTP_200_OK)

        except SchoolBoard.DoesNotExist:
            return Response({"error": "Board not found."}, status=status.HTTP_404_NOT_FOUND)
        except SchoolDefaultClasses.DoesNotExist:
            return Response({"error": "Class not found."}, status=status.HTTP_404_NOT_FOUND)
        except SchoolDefaultSubjects.DoesNotExist:
            return Response({"error": "Subject not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(f"Error retrieving eBook: {e}")
            return Response({"error": "An error occurred while retrieving the eBook."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete_ebook_by_id(self, request):
        """Delete an eBook."""
        try:
            ebook_id = request.query_params.get("ebook_id")
            if not ebook_id:
                return Response({"error": "eBook ID is required."},
                                status=status.HTTP_400_BAD_REQUEST)

            ebook = SchoolSyllabusEbooks.objects.get(id=ebook_id)
            # try:
            #     s3_client.delete_file(f"{ebook.file_path}.pdf")
            #     s3_client.delete_file(f"{ebook.file_path}.txt")
            # except Exception as e:
            #     logger.error(f"Error deleting files from S3: {e}")
            ebook.is_active = False
            ebook.save()

            logger.info("eBook with ID %s deleted successfully.",ebook_id)
            return Response({"message": "eBook deleted successfully."}, status=status.HTTP_200_OK)
        except SchoolSyllabusEbooks.DoesNotExist:
            return Response({"error": "eBook not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(f"Error deleting eBook: {e}")
            return Response({"error": "An error occurred while deleting the eBook."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def extract_topics_and_prerequisites(self, pdf_file, ebook, previously_uploaded_ebook_id):
        """Extract topics and prerequisites from the provided PDF file."""

        lang_chain_service = LangChainService()

        chapters_obj,pdf_text = lang_chain_service.get_topics_and_prerequisites(pdf_file)

        with transaction.atomic():
            Chapter.objects.filter(ebook_id=previously_uploaded_ebook_id).delete()
            for chapter_item in chapters_obj:
                chapter = Chapter.objects.create(
                    chapter_number=chapter_item['chapter_number'],
                    ebook=ebook,
                    chapter_name=chapter_item['chapter_name']
                )

                for sub_topic in chapter_item['sub_topics']:
                    sub_topic_obj = SubTopic.objects.create(
                        chapter=chapter,
                        name=sub_topic
                    )
                    
                for prerequisite in chapter_item['pre_requisites']:
                    prerequisite_obj = Prerequisite.objects.create(
                        chapter=chapter,
                        topic=prerequisite['topic'],
                        explanation=prerequisite['explanation']
                    )
        
        return True, pdf_text
    
    def copy_syllabus_data_to_school_db(self,school_db_metadata,academic_year_id):
        try:
            school_db_name = school_db_metadata.db_name
            
            with transaction.atomic(using=school_db_name):
                boards = SchoolBoardMapping.objects.filter(school_id = school_db_metadata.school_id)
                for board in boards:
                    ebooks = SchoolSyllabusEbooks.objects.filter(board_id = board.board_id).select_related('class_number', 'subject')
                    for ebook in ebooks:
                        chapters = Chapter.objects.filter(ebook=ebook)
                        for chapter in chapters:
                            school_class_obj = SchoolClass.objects.using(school_db_name).get(
                                class_number=ebook.class_number_id
                            )
                            school_chapter_obj = SchoolChapter.objects.using(school_db_name).create(
                                school_board_id=board.board_id,
                                academic_year_id=academic_year_id,
                                class_number=school_class_obj,
                                subject_id=ebook.subject_id,
                                chapter_number=chapter.chapter_number,
                                chapter_name=chapter.chapter_name,
                                ebook_id=ebook.id
                            )
                            sub_topics = SubTopic.objects.filter(chapter=chapter)
                            for sub_topic in sub_topics:
                                SchoolSubTopic.objects.using(school_db_name).create(
                                    chapter=school_chapter_obj,
                                    name=sub_topic.name
                                )
                            prerequisites = Prerequisite.objects.filter(chapter=chapter)
                            for prerequisite in prerequisites:
                                SchoolPrerequisite.objects.using(school_db_name).create(
                                    chapter=school_chapter_obj,
                                    topic=prerequisite.topic,
                                    explanation=prerequisite.explanation
                                )
                    logger.info(f"Syllabus data for board {board.board_id} copied to school DB {school_db_name} successfully.")
            logger.info(f"Syllabus data copied to school DB {school_db_name} successfully.")
            return True
        except Exception as e:
            logger.error(f"Error copying syllabus data to school DB {school_db_name}: {str(e)}")
            return False