from pydantic import BaseModel


class DBSettings(BaseModel):
    HOST: str
    PORT: str
    NAME: str
    USER: str
    PASS: str

    @property
    def postgres_dsn(self) -> str:
        return (
            f"postgresql+asyncpg://{self.USER}:{self.PASS}"
            f"@{self.HOST}:{self.PORT}/{self.NAME}"
        )
