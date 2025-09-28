from typing import Optional, Dict, List
from dataclasses import dataclass

from aiogram.exceptions import TelegramBadRequest

from app.telegram.blocks.base import BaseBlock, BlockDTO
from app.telegram.blocks.start import StartBlock
from app.telegram.blocks.message import MessageBlock
from app.telegram.blocks.menu import MenuBlock
from app.telegram.blocks.delay import DelayBlock
from app.telegram.blocks.input_data import InputDataBlock
from app.telegram.context import ScenarioContext
from app.enums import BlockType, BlockConnectionPoint


@dataclass
class Connection:
    """Модель соединения между блоками"""

    from_block_id: str
    from_point: str
    to_block_id: str
    to_point: str

    @classmethod
    def from_dict(cls, data: dict) -> "Connection":
        return cls(
            from_block_id=data["from"]["block_id"],
            from_point=data["from"]["point"],
            to_block_id=data["to"]["block_id"],
            to_point=data["to"]["point"],
        )


class ScenarioInterpreter:
    """Интерпретатор сценария для выполнения блоков"""

    BLOCK_TYPE_MAPPING = {
        BlockType.START.value: StartBlock,
        BlockType.MESSAGE.value: MessageBlock,
        BlockType.MENU.value: MenuBlock,
        BlockType.DELAY.value: DelayBlock,
        BlockType.INPUT_DATA.value: InputDataBlock,
    }

    def __init__(self, scenario_data: dict):
        self.blocks: Dict[str, BaseBlock] = self._parse_blocks(scenario_data["blocks"])
        self.connections: List[Connection] = [
            Connection.from_dict(conn) for conn in scenario_data["connections"]
        ]

    def _parse_blocks(self, blocks_data: list[dict]) -> Dict[str, BaseBlock]:
        """Парсинг блоков сценария"""
        parsed_blocks = {}
        for block_data in blocks_data:
            dto = BlockDTO(**block_data)
            block_class = self.BLOCK_TYPE_MAPPING.get(dto.type, None)
            if block_class:
                parsed_blocks[dto.id] = block_class(dto)
        return parsed_blocks

    def get_next_block(
        self,
        current_block_id: str,
        connection_point: str,
    ) -> Optional[tuple[str, str]]:
        """Получение следующего блока по соединению"""
        for connection in self.connections:
            if (
                connection.from_block_id == current_block_id
                and connection.from_point == connection_point
            ):
                return connection.to_block_id, connection.to_point
        return None

    async def _process_block(
        self,
        context: ScenarioContext,
        current_block: BaseBlock,
    ) -> Optional[str]:
        """Обработка текущего блока"""
        if isinstance(current_block, MenuBlock) and context.entry_point:
            result = self.get_next_block(
                current_block.id,
                context.entry_point,
            )
            if result:
                next_block_id, entry_point = result
                context.entry_point = entry_point
                return next_block_id

        # Получаем точку выхода из блока
        exit_point = await current_block.execute(context)

        # Если блок не вернул точку выхода, используем entry_point или "next"
        if not exit_point:
            exit_point = context.entry_point or BlockConnectionPoint.NEXT.value

        # Ищем следующий блок
        result = self.get_next_block(
            current_block.id,
            exit_point,
        )

        if result:
            next_block_id, entry_point = result
            context.entry_point = entry_point
            return next_block_id

        return None

    async def delete_all_keyboards_in_context(self, context: ScenarioContext) -> None:
        """Удаление всех клавиатур в контексте"""
        for message_id in context.user_history.copy():  # Используем копию для безопасного удаления
            try:
                await context.bot.edit_message_reply_markup(
                    chat_id=context.chat_id,
                    message_id=int(message_id),
                    reply_markup=None,
                )
            except TelegramBadRequest as e:
                error_message = str(e).lower()
                # Игнорируем ошибки, если сообщение уже удалено или не имеет клавиатуры
                if any(msg in error_message for msg in [
                    "message to edit not found",
                    "message is not modified",
                    "message can't be edited"
                ]):
                    context.user_history.discard(message_id)  # Удаляем из истории
                    continue
                raise
        context.user_history.clear()

    async def execute(self, context: ScenarioContext) -> None:
        """Выполнение сценария"""
        try:
            current_block = self.blocks.get(context.current_block_id)
            if not current_block:
                return

            # Удаляем все клавиатуры в контексте
            if context.update.callback_query:
                await self.delete_all_keyboards_in_context(context)

            while True:
                # Вызываем on_entry если есть точка входа
                if context.entry_point == BlockConnectionPoint.START.value:
                    await current_block.on_entry(context)

                next_block_id = await self._process_block(context, current_block)
                if not next_block_id:
                    break

                # Обновляем контекст для следующего блока
                context.current_block_id = next_block_id
                current_block = self.blocks.get(next_block_id)

        except TelegramBadRequest as e:
            print(f"⚠️ Ошибка при выполнении сценария: {e}")
            return
