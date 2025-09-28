import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.scenarios.schemas.trigger import TriggerReadSchema
from app.users_data.schemas import UserFieldReadSchema


class ScenarioReadSchema(BaseModel):
    id: int
    name: str
    enabled: bool
    data: Optional[dict]
    draft: Optional[dict]
    bot: Optional["BotShortReadSchema"]
    triggers: list[TriggerReadSchema]
    fields: list[UserFieldReadSchema]
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = {
        "from_attributes": True,
    }


class ScenarioCreateSchema(BaseModel):
    name: str = Field(..., max_length=245)
    data: dict


# --- Scenario updates schemas
class ScenarioUpdateSchema(BaseModel):
    pass


class ScenarioPatchSchema(ScenarioUpdateSchema):
    name: Optional[str] = Field(None, max_length=245)
    draft: Optional[dict] = None


class ScenarioLinkSchema(ScenarioUpdateSchema):
    bot_id: int


class ScenarioDraftSchema(ScenarioUpdateSchema):
    data: Optional[dict]
    draft: Optional[None] = None


from app.bots.schemas import BotShortReadSchema

ScenarioReadSchema.model_rebuild()
