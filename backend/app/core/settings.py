import os
from dotenv import load_dotenv

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.core.config.app import AppSettings
from app.core.config.db import DBSettings
from app.core.config.jwt import JWTSettings
from app.core.config.s3 import S3Settings
from app.core.config.redis import RedisSettings

# ENV_PATH = os.environ.get("ENV_FILE", str(Path(__file__).parent.parent.parent.parent / ".env"))

if not os.getenv("DB_USER"):
    base_dir = Path(__file__).resolve().parent.parent.parent.parent
    env_path = base_dir / ".env"
    if env_path.exists():
        load_dotenv(env_path)


class Settings(BaseSettings):
    app: AppSettings
    db: DBSettings
    jwt: JWTSettings
    s3: S3Settings
    redis: RedisSettings

    model_config = SettingsConfigDict(
        env_file=None,
        env_file_encoding="utf-8",
        env_nested_delimiter="_",
        env_nested_max_split=1,
        # extra='ignore',
    )


settings = Settings()
