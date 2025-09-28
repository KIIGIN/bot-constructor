from pydantic import BaseModel


class S3Settings(BaseModel):
    ENDPOINT: str
    BUCKET: str
    ACCESS_KEY: str
    SECRET_KEY: str

    @property
    def config(self) -> dict[str, str]:
        return {
            'access_key': self.ACCESS_KEY,
            'secret_key': self.SECRET_KEY,
            'endpoint_url': self.ENDPOINT,
            'bucket_name': self.BUCKET,
        }
