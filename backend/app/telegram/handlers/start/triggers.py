from typing import Optional
from dataclasses import dataclass
from app.enums import TriggerType


@dataclass
class Trigger:
    """Модель триггера"""
    type: str
    enabled: bool
    data: dict


@dataclass
class StartBlock:
    """Модель стартового блока"""
    id: str
    type: str
    data: dict


class TriggerHandler:
    """Обработчик триггеров"""
    def __init__(self, start_block: dict):
        self.start_block = StartBlock(
            id=start_block["id"], type=start_block["type"], data=start_block["data"]
        )
        self.active_triggers = [
            Trigger(type=t["type"], enabled=t["enabled"], data=t.get("data", {}))
            for t in start_block["data"]["triggers"]
            if t["enabled"]
        ]

    async def check_triggers(self, message_text: Optional[str]) -> bool:
        """Проверка выполнения хотя бы одного активного триггера"""
        if not message_text:
            return False

        message_text = message_text.lower()

        for trigger in self.active_triggers:
            if await self._check_trigger(trigger, message_text):
                return True

        return False

    async def _check_trigger(self, trigger: Trigger, message_text: str) -> bool:
        """Проверка конкретного триггера"""
        if trigger.type == TriggerType.START.value:
            return message_text == "/start"

        if trigger.type == TriggerType.KEY_WORD.value:
            keywords = trigger.data.get("key_words", [])
            return any(kw.lower() in message_text for kw in keywords)

        return False


async def check_active_triggers(start_block: dict, message_text: Optional[str]) -> bool:
    """Публичный интерфейс для проверки триггеров"""
    handler = TriggerHandler(start_block)
    return await handler.check_triggers(message_text)
