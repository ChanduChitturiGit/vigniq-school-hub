"""Aws s3 Bucket Module"""

import logging
import os
from typing import Optional, List

import boto3
from botocore.exceptions import ClientError
from botocore.client import Config


from django.conf import settings

logger = logging.getLogger(__name__)


class AwsS3Bucket:
    def __init__(self):
        self.bucket_name = settings.AWS_CONFIG['S3_BUCKET_NAME']
        self.s3 = boto3.client(
            "s3",
            region_name=settings.AWS_CONFIG['REGION_NAME'],
            aws_access_key_id=settings.AWS_CONFIG['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=settings.AWS_CONFIG['AWS_SECRET_ACCESS_KEY'],
            config=Config(signature_version='s3v4')
        )

    def upload_file(self, file, s3_key: str) -> bool:
        try:
            self.s3.upload_fileobj(file, self.bucket_name, s3_key)
            logger.info("File uploaded successfully to S3: %s", s3_key)
            return True
        except ClientError as e:
            logger.error("Upload failed: %s", e)
            return False

    def file_exists(self, s3_key: str) -> bool:
        try:
            self.s3.head_object(Bucket=self.bucket_name, Key=s3_key)
            logger.info("File exists in S3: %s", s3_key)
            return True
        except Exception as e:
            logger.error("Error checking file existence: %s", e)
            return False

    def generate_temp_link(self, s3_key: str, expires_in: int = 3600) -> Optional[str]:
        try:
            url = self.s3.generate_presigned_url(
                ClientMethod='get_object',
                Params={'Bucket': self.bucket_name, 'Key': s3_key,'ResponseContentDisposition': 'inline'},
                ExpiresIn=expires_in
            )
            logger.info("Generated temporary URL for key: %s", s3_key)
            return url
        except ClientError as e:
            logger.error("Error generating URL: %s", e)
            return None

    def download_file(self, s3_key: str, file_path: str) -> bool:
        try:
            self.s3.download_file(self.bucket_name, s3_key, file_path)
            logger.info("File downloaded successfully from S3: %s", s3_key)
            return True
        except ClientError as e:
            logger.error("Download failed: %s", e)
            return False

    def list_files(self, prefix: str = "") -> List[str]:
        try:
            paginator = self.s3.get_paginator("list_objects_v2")
            result = []
            for page in paginator.paginate(Bucket=self.bucket_name, Prefix=prefix):
                for obj in page.get("Contents", []):
                    result.append(obj["Key"])
            logger.info("Listed files in S3 with prefix '%s'", prefix)
            return result
        except ClientError as e:
            logger.error("Error listing files: %s", e)
            return []

    def delete_file(self, s3_key: str) -> bool:
        try:
            self.s3.delete_object(Bucket=self.bucket_name, Key=s3_key)
            logger.info("File deleted successfully from S3: %s", s3_key)
            return True
        except ClientError as e:
            logger.error("Delete failed: %s", e)
            return False
