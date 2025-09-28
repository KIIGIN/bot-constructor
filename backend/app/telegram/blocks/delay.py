import asyncio
from typing import Optional

from app.telegram.blocks.base import BaseBlock
from app.telegram.context import ScenarioContext
from app.enums import BlockConnectionPoint


class DelayBlock(BaseBlock):
    TIME_MULTIPLIERS = {
        "seconds": 1,
        "minutes": 60,
        "hours": 3600,
        "days": 86400,
    }

    async def execute(self, context: ScenarioContext) -> Optional[str]:
        delay_data = self.data.get("value", {})
        raw_duration = delay_data.get("duration", 0)
        measurement = delay_data.get("measurement", "seconds")

        try:
            duration = max(0, int(raw_duration))
            multiplier = self.TIME_MULTIPLIERS.get(measurement)

            if multiplier is None:
                return None

            total_seconds = duration * multiplier
            await asyncio.sleep(total_seconds)

            return BlockConnectionPoint.NEXT.value

        except (ValueError, TypeError) as e:
            return None

    async def on_entry(self, context: ScenarioContext) -> None:
        pass
