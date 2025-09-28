from pydantic import BaseModel


class AppSettings(BaseModel):
    CLIENT_URL: str
    WEBHOOK_URL: str
    ENCRYPTION_KEY: str

    @property
    def webhook_path(self) -> str:
        return f"{self.WEBHOOK_URL}/api/webhook"
