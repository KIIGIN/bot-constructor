import re
from typing import Optional, Any

from abc import ABC, abstractmethod
from dataclasses import dataclass

from aiogram.types import InlineKeyboardMarkup, Message
from aiogram.exceptions import TelegramAPIError

from app.telegram.context import ScenarioContext
from app.telegram.utils import clean_telegram_html


@dataclass
class BlockDTO:
    """Модель данных блока"""

    id: str
    type: str
    data: dict[str, Any]


class BaseBlock(ABC):
    def __init__(self, block_data: BlockDTO):
        self.id = block_data.id
        self.type = block_data.type
        self.data = block_data.data

    def _clean_text(self, text: str) -> str:
        """Очистка текста (может быть переопределена в дочерних классах)"""
        return clean_telegram_html(text)

    def _replace_variables(self, text: str, context: ScenarioContext) -> str:
        """Заменяет переменные в тексте на их значения из контекста"""

        def replace_var(match):
            var_name = match.group(1)
            # Ищем значение переменной в сохраненных данных пользователя
            for scenario_id, data in context.user_input.items():
                if (
                    isinstance(data, dict)
                    and context.scenario_id == scenario_id
                    and data.get(var_name, None)
                ):
                    return str(data[var_name].get("field_value", ""))
            return match.group(0)  # Если переменная не найдена, оставляем как есть

        return re.sub(r"{{(.*?)}}", replace_var, text)

    async def _send_message(
        self,
        context: ScenarioContext,
        text: str,
        keyboard: InlineKeyboardMarkup = None,
    ) -> None:
        try:
            message = await context.bot.send_message(
                chat_id=context.chat_id,
                text=self._replace_variables(self._clean_text(text), context),
                reply_markup=keyboard,
            )
            if keyboard:
                context.user_history.add(str(message.message_id))
        except TelegramAPIError as e:
            await self._handle_error(context, e)
            return None

    async def _handle_error(self, context: ScenarioContext, error: Exception):
        await context.bot.send_message(
            chat_id=context.chat_id,
            text=f"⚠️ Произошла ошибка при отправке сообщения: {error}",
        )

    @abstractmethod
    async def execute(self, context: ScenarioContext) -> Optional[str]:
        """Выполнение блока. Возвращает точку выхода или None"""
        pass

    @abstractmethod
    async def on_entry(self, context: ScenarioContext) -> None:
        """Вызывается при входе в блок"""
        pass
