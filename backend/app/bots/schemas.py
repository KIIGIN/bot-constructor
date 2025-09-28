import re
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class BaseBotReadSchema(BaseModel):
    id: int
    first_name: str
    enabled: bool
    username: str

    model_config = {
        "from_attributes": True,
    }


class BotReadSchema(BaseBotReadSchema):
    scenarios: list["ScenarioReadSchema"]


class BotShortReadSchema(BaseBotReadSchema):
    pass


class BotCreateSchema(BaseModel):
    token: str = Field(..., max_length=60)

    @field_validator("token")
    def validate_token_format(cls, token: str) -> str:
        pattern = r'^\d{8,10}:[\w-]{30,50}$'
        if not re.match(pattern, token):
            raise ValueError("Invalid Telegram bot token format")
        return token


class BotDefinitionSchema(BaseModel):
    bot_id: int
    scenario_id: int


class BotPatchSchema(BaseModel):
    first_name: Optional[str] = Field(default=None, max_length=100)


from app.scenarios.schemas.scenario import ScenarioReadSchema

BotReadSchema.model_rebuild()
