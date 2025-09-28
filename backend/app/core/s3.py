from typing import Union, AsyncGenerator, BinaryIO
from contextlib import asynccontextmanager

from aiobotocore.session import get_session

from app.core.settings import settings


class S3Client:
    def __init__(
            self,
            access_key: str,
            secret_key: str,
            endpoint_url: str,
            bucket_name: str,
    ):
        self.config = {
            'aws_access_key_id': access_key,
            'aws_secret_access_key': secret_key,
            'endpoint_url': endpoint_url,
        }
        self.bucket_name = bucket_name
        self.session = get_session()

    @asynccontextmanager
    async def get_client(self) -> AsyncGenerator:
        async with self.session.create_client('s3', **self.config) as client:
            yield client

    async def upload_file(
            self,
            file_data: Union[bytes, BinaryIO],
            object_name: str,
    ) -> dict:
        async with self.get_client() as client:
            await client.put_object(
                Bucket=self.bucket_name,
                Key=object_name,
                Body=file_data,
            )

            return {
                "url": f"{self.config['endpoint_url']}/{self.bucket_name}/{object_name}",
                "size": len(file_data)
            }


def get_s3_client() -> S3Client:
    return S3Client(**settings.s3.config)
