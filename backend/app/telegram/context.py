from dataclasses import dataclass, field
from aiogram import Bot
from aiogram.types import Update
from typing import Optional, Any


@dataclass
class ScenarioContext:
    """Контекст выполнения сценария с явными данными."""
    
    update: Update
    bot: Bot
    user_id: str
    chat_id: str
    scenario_id: str
    scenario_data: dict[str, Any]
    username: Optional[str] = None
    current_block_id: Optional[str] = None
    user_input: dict[str, Any] = field(default_factory=dict)
    user_history: set[str] = field(default_factory=set)
    entry_point: Optional[str] = None
    db_data_loaded: dict[str, Any] = field(default_factory=dict)

    @classmethod
    async def create(
        cls,
        update: Update,
        bot: Bot,
        scenario_id: int,
        scenario_data: dict[str, Any],
    ) -> "ScenarioContext":
        """Создает контекст с проверкой типа Update."""
        if message_update := update.message:
            user_id = message_update.from_user.id
            username = message_update.from_user.username
            chat_id = message_update.chat.id
        elif callback_update := update.callback_query:
            user_id = callback_update.from_user.id
            username = callback_update.from_user.username
            chat_id = callback_update.message.chat.id
        else:
            raise ValueError("Unsupported Update type. Must be Message or CallbackQuery.")
        
        return cls(
            update=update,
            bot=bot,
            user_id=str(user_id),
            username=username,
            chat_id=str(chat_id),
            scenario_id=str(scenario_id),
            scenario_data=scenario_data,
        )
