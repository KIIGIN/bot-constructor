from typing import Optional

from app.telegram.blocks.base import BaseBlock
from app.telegram.context import ScenarioContext
from app.enums import BlockConnectionPoint


class StartBlock(BaseBlock):
    async def execute(self, context: ScenarioContext) -> Optional[str]:
        return BlockConnectionPoint.NEXT.value

    async def on_entry(self, context: ScenarioContext) -> None:
        pass
