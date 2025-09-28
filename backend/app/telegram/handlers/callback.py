from typing import Optional, Any
from dataclasses import dataclass
from aiogram.types import CallbackQuery

from app.telegram.context import ScenarioContext
from app.enums import BlockType


@dataclass
class ButtonSchema:
    id: str
    text: str


@dataclass
class BlockSchema:
    """Модель блока"""
    id: str
    type: str
    data: dict[str, Any]


class CallbackHandler:
    """Обработчик callback-запросов"""
    ERROR_MESSAGE = "Устаревшая кнопка. Обновите диалог."

    def __init__(self, context: ScenarioContext):
        self.context = context
        self.callback_query: CallbackQuery = context.update.callback_query

    async def handle(self) -> bool:
        """Обработка callback-запроса"""
        current_block = self._find_current_block()
        
        if not current_block:
            await self._handle_error()
            return False

        button = self._find_matching_button(current_block)
        if not button:
            await self._handle_error()
            return False

        await self._process_button_click(button)
        return True

    def _find_current_block(self) -> Optional[BlockSchema]:
        """Поиск текущего меню пользователя"""
        for block in self.context.scenario_data["blocks"]:
            if block["id"] == self.context.current_block_id:
                return BlockSchema(
                    id=block["id"],
                    type=block["type"],
                    data=block["data"],
                )
        return None

    def _find_matching_button(self, block: BlockSchema) -> Optional[BlockSchema]:
        """Поиск кнопки по callback_data"""
        for button_data in block.data.get("buttons", []):
            if button_data["id"] == self.callback_query.data:
                return ButtonSchema(
                    id=button_data["id"],
                    text=button_data["text"],
                )
        return None

    async def _process_button_click(self, button: ButtonSchema) -> None:
        """Обработка нажатия на кнопку"""
        # Обновляем контекст
        self.context.entry_point = button.id

        # Отвечаем Telegram
        await self.context.bot.answer_callback_query(
            callback_query_id=self.callback_query.id
        )

    async def _handle_error(self) -> None:
        """Обработка ошибок callback"""
        await self.context.bot.answer_callback_query(
            callback_query_id=self.callback_query.id,
            text=self.ERROR_MESSAGE,
        )


async def handle_callback(context: ScenarioContext) -> bool:
    """Публичный интерфейс для обработки callback"""
    handler = CallbackHandler(context)
    return await handler.handle()
