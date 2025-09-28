from typing import Optional

from app.telegram.context import ScenarioContext
from app.telegram.blocks.content import ContentBlock
from app.enums import BlockConnectionPoint


class MenuBlock(ContentBlock):
    DEFAULT_TEXT = "Меню:"

    def __init__(self, block_data):
        super().__init__(block_data)
        self.content = self._prepare_content(block_data)

    async def execute(self, context: ScenarioContext) -> Optional[str]:
        return BlockConnectionPoint.NEXT.value

    async def on_entry(self, context: ScenarioContext) -> None:
        """Вызывается при входе в блок"""
        keyboard = self._build_keyboard(self.content.buttons)
        await self._send_message(
            context=context,
            text=self.content.text,
            keyboard=keyboard,
        )
