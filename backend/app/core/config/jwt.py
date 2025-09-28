from datetime import timedelta

from pydantic import BaseModel

from authx import AuthXConfig


class JWTSettings(BaseModel):
    SECRET_KEY: str

    @property
    def auth_config(self) -> AuthXConfig:
        config: AuthXConfig = AuthXConfig()

        config.JWT_ALGORITHM = "HS256"
        config.JWT_SECRET_KEY = self.SECRET_KEY
        config.JWT_TOKEN_LOCATION = ["cookies"]
        config.JWT_ACCESS_COOKIE_NAME = "access_token"
        config.JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)

        config.JWT_REFRESH_COOKIE_NAME = "refresh_token"
        config.JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)

        config.JWT_COOKIE_CSRF_PROTECT = False

        return config
