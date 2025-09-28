from typing import Annotated

from fastapi import Depends

from app.core.s3 import get_s3_client, S3Client

S3ClientDI = Annotated[S3Client, Depends(get_s3_client)]
