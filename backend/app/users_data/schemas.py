from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.enums import FieldType


class UserFieldBaseSchema(BaseModel):
    name: str
    type: FieldType
    variable: str
    scenario_id: int


class UserFieldCreateSchema(UserFieldBaseSchema):
    pass


class UserFieldReadSchema(UserFieldBaseSchema):
    id: int
    values: list["UserFieldValueReadSchema"]
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


class UserFieldValueBaseSchema(BaseModel):
    user_id: int
    username: Optional[str]
    value: str


class UserFieldValueCreateSchema(UserFieldValueBaseSchema):
    field_id: int


class UserFieldValueReadSchema(UserFieldValueBaseSchema):
    id: int
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


class UserFieldSchema(UserFieldValueBaseSchema, UserFieldBaseSchema):
    pass
