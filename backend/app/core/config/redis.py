from pydantic import BaseModel

from redis.asyncio import Redis


class RedisSettings(BaseModel):
    HOST: str
    PORT: int
    PASSWORD: str
    DB: int

    @property
    def client(self) -> Redis:
        return Redis(
            host=self.HOST,
            port=self.PORT,
            password=self.PASSWORD,
            db=self.DB,
            decode_responses=True,
        )
