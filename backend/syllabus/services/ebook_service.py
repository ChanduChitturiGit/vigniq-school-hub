"""Ebook Service Module"""

import logging

from django.db import transaction

from rest_framework.response import Response
from rest_framework import status

from core import s3_client
from school.models import (
    SchoolDefaultClasses,
    Chapter,
    Prerequisite,
    SubTopic,
    SchoolBoard,
    SchoolDefaultSubjects,
    SchoolSyllabusEbooks
)
from syllabus.models import SchoolChapter,SchoolSubTopic, SchoolPrerequisite

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

            upload_success = s3_client.upload_file(file, s3_key)
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
                    self.extract_topics_and_prerequisites(file,ebook)
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

    def extract_topics_and_prerequisites(self, pdf_file, ebook):
        """Extract topics and prerequisites from the provided PDF file."""

        lang_chain_service = LangChainService()
        chapters_obj = lang_chain_service.get_topics_and_prerequisites(pdf_file)
        with transaction.atomic():
            for chapter_item in chapters_obj:
                chapter, _ = Chapter.objects.update_or_create(
                    chapter_number=chapter_item['chapter_number'],
                    school_board_id=ebook.board_id,
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
        