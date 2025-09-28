from typing import Optional

from pydantic import BaseModel

from app.enums import TriggerType


class TriggerReadSchema(BaseModel):
    type: TriggerType
    data: dict
    enabled: bool

    model_config = {
        'from_attributes': True,
    }


class TriggerCreateSchema(BaseModel):
    type: TriggerType
    data: dict
    enabled: bool


class TriggerPatchSchema(BaseModel):
    enabled: Optional[bool] = None
    data: Optional[dict] = None

