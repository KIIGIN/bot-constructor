from typing import Optional, Any

from pydantic import BaseModel, Field


class UserState(BaseModel):
    """Модель состояния пользователя в сценарии"""
    user_id: int
    scenario_id: int
    current_block_id: Optional[str] = None
    variables: dict = Field(default_factory=dict)
    user_history: set[str] = Field(default_factory=set)
    db_data_loaded: dict[str, Any] = Field(default_factory=dict)

    model_config = {
        "from_attributes": True,
    }
