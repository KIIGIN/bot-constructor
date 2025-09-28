from typing import Optional
from dataclasses import dataclass
from app.telegram.context import ScenarioContext
from app.telegram.handlers.start.triggers import check_active_triggers
from app.enums import BlockType


@dataclass
class StartBlock:
    """Модель стартового блока"""

    id: str
    type: str
    data: dict


class StartHandler:
    """Обработчик стартового блока"""

    def __init__(self, context: ScenarioContext):
        self.context = context
        self.message_text = (
            context.update.message.text if context.update.message else None
        )

    async def handle(self) -> bool:
        """Обработка стартового блока"""
        start_block = self._find_start_block()

        if not start_block:
            return False

        if not await self._check_triggers(start_block):
            return False

        await self._update_context(start_block)
        return True

    def _find_start_block(self) -> Optional[StartBlock]:
        """Поиск стартового блока"""
        for block in self.context.scenario_data["blocks"]:
            if block["type"] == BlockType.START.value:
                return StartBlock(
                    id=block["id"], type=block["type"], data=block["data"]
                )
        return None

    async def _check_triggers(self, start_block: StartBlock) -> bool:
        """Проверка триггеров"""
        return await check_active_triggers(start_block.__dict__, self.message_text)

    async def _update_context(self, start_block: StartBlock) -> None:
        """Обновление контекста"""
        self.context.current_block_id = start_block.id
        # self.context.user_input = {}


async def handle_start(context: ScenarioContext) -> bool:
    """Публичный интерфейс для обработки стартового блока"""
    handler = StartHandler(context)
    return await handler.handle()
