"""Ebook Service Module"""

import logging
from io import BytesIO
from django.db import transaction

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
from core.common_modules.aws_s3_bucket import AwsS3Bucket
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

            if not file:
                logger.error("No file provided for upload.")
                return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)
            if not upload_type or not board_id or not class_id or not subject_id:
                logger.error("Missing required fields for eBook upload.")
                return Response({"error": "Missing required fields."},
                                status=status.HTTP_400_BAD_REQUEST)

            class_obj = SchoolDefaultClasses.objects.get(id=class_id)
            board_obj = SchoolBoard.objects.get(id=board_id)
            subject_obj = SchoolDefaultSubjects.objects.get(id=subject_id)

            if upload_type == 'chapter_wise':
                file_name = f"{subject_obj.name}_chapter_{chapter_number}"
                s3_key = f"ebooks/class_{class_obj.class_number}/{board_obj.board_name.replace(' ', '_')}/{subject_obj.name}/{file_name}"
            else:
                file_name = subject_obj.name
                s3_key = f"ebooks/class_{class_obj.class_number}/{board_obj.board_name.replace(' ', '_')}/{file_name}"

            file_bytes = file.read()
            upload_success = s3_client.upload_file(BytesIO(file_bytes), s3_key)
            if upload_success:
                with transaction.atomic():
                    ebook, created = SchoolSyllabusEbooks.objects.update_or_create(
                        board=board_obj,
                        subject=subject_obj,
                        class_number=class_obj,
                        ebook_type=upload_type,
                        ebook_name=file_name,
                        defaults={"file_path": s3_key}
                    )
                    self.extract_topics_and_prerequisites(BytesIO(file_bytes), ebook)
                return Response({"message": "eBook uploaded successfully"}, status=status.HTTP_201_CREATED)
            else:
                return Response({"error": "Failed to upload eBook."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
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
        """Retrieve eBook details."""
        try:
            board_id = request.GET.get("board_id")
            class_id = request.GET.get("class_id")
            subject_id = request.GET.get("subject_id")
            page = int(request.GET.get("page", 1))

            page_size = 10
            if not board_id or not class_id:
                logger.error("Missing required fields for eBook retrieval.")
                return Response({"error": "Missing required fields."}, status=status.HTTP_400_BAD_REQUEST)
            board = SchoolBoard.objects.get(id=board_id)
            class_obj = SchoolDefaultClasses.objects.get(id=class_id)
            if subject_id:
                subject = SchoolDefaultSubjects.objects.filter(id=subject_id)
            else:
                subject = SchoolDefaultSubjects.objects.all()

            ebooks_obj = SchoolSyllabusEbooks.objects.filter(
                board=board,
                class_number=class_obj,
                subject__in=subject
            )
            ebooks = ebooks_obj.order_by('id')[(page - 1) * page_size: page * page_size]
            if ebooks_obj and not ebooks:
                return Response({"message": "End of ebooks.",'data':[]}, status=status.HTTP_204_NO_CONTENT)
            if not ebooks:
                return Response({"error": "No eBooks found for the given criteria."},
                                status=status.HTTP_404_NOT_FOUND)

            ebook_list = []
            for ebook in ebooks:
                ebook_list.append({
                    "id": ebook.id,
                    "file_path": s3_client.generate_temp_link(ebook.file_path),
                    "ebook_name": ebook.ebook_name,
                    "ebook_type": ebook.ebook_type
                })

            logger.info(f"Retrieved {len(ebook_list)} eBooks for board {board.board_name}, class {class_obj.class_number}.")
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
    
    def delete_ebook(self, request):
        """Delete an eBook."""
        try:
            ebook_id = request.query_params.get("ebook_id")
            if not ebook_id:
                return Response({"error": "eBook ID is required."},
                                status=status.HTTP_400_BAD_REQUEST)

            ebook = SchoolSyllabusEbooks.objects.get(id=ebook_id)
            s3_client.delete_file(ebook.file_path)
            ebook.delete()

            logger.info("eBook with ID %s deleted successfully.",ebook_id)
            return Response({"message": "eBook deleted successfully."}, status=status.HTTP_200_OK)
        except SchoolSyllabusEbooks.DoesNotExist:
            return Response({"error": "eBook not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(f"Error deleting eBook: {e}")
            return Response({"error": "An error occurred while deleting the eBook."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def extract_topics_and_prerequisites(self, pdf_file, ebook):
        """Extract topics and prerequisites from the provided PDF file."""

        lang_chain_service = LangChainService()
        chapters_obj = lang_chain_service.get_topics_and_prerequisites(pdf_file)
        with transaction.atomic():
            for chapter_item in chapters_obj:
                chapter, _ = Chapter.objects.update_or_create(
                    chapter_number=chapter_item['chapter_number'],
                    ebook=ebook,
                    defaults={'chapter_name': chapter_item['chapter_name']}
                )

                for sub_topic in chapter_item['sub_topics']:
                    sub_topic_obj, _ = SubTopic.objects.update_or_create(
                        chapter=chapter,
                        name=sub_topic
                    )
                    
                for prerequisite in chapter_item['pre_requisites']:
                    prerequisite_obj, _ = Prerequisite.objects.update_or_create(
                        chapter=chapter,
                        topic=prerequisite['topic'],
                        defaults={'explanation': prerequisite['explanation']}
                    )
        
        return True
    
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
                                chapter_name=chapter.chapter_name
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