import re

from datetime import datetime
from typing import Any, Optional
from dataclasses import dataclass

from app.telegram.blocks.content import ContentBlock
from app.telegram.context import ScenarioContext
from app.enums import FieldType, BlockConnectionPoint


@dataclass
class InputData:
    field_name: str
    field_type: str
    variable_name: str
    validation_failed_text: str


class InputDataBlock(ContentBlock):
    """Блок ввода данных"""

    def __init__(self, block_data):
        super().__init__(block_data)
        self.content = self._prepare_content(block_data)
        self.input_data = InputData(
            field_name=block_data.data["field_name"],
            field_type=block_data.data["field_type"],
            variable_name=block_data.data["variable_name"],
            validation_failed_text=block_data.data["validation_failed_text"],
        )

    async def execute(self, context: ScenarioContext) -> Optional[str]:
        """Выполняет блок ввода данных"""
        message = context.update.message
        callback = context.update.callback_query
        self.get_state(context)

        # Если данные уже введены — переходим дальше
        if self.is_already_filled(context):
            return BlockConnectionPoint.COMPLETED.value

        if self.is_waiting(context) and callback:
            # Отмена ввода данных (нажата кнопка в блоке)
            self.reset_waiting_flag(context)
            return None

        if self.is_waiting(context) and message:
            # Если данных нет — обрабатываем ввод
            is_valid = await self.handle_input(
                context,
                message.text,
            )
            return BlockConnectionPoint.COMPLETED.value if is_valid else None

        self.set_waiting_flag(context)
        return None

    async def on_entry(self, context: ScenarioContext) -> None:
        """Вызывается при входе в блок"""
        if self.is_already_filled(context):
            return None

        await self._send_message(
            context=context,
            text=self.content.text,
            keyboard=self._build_keyboard(self.content.buttons),
        )

    async def handle_input(
        self,
        context: ScenarioContext,
        text: str,
    ) -> bool:
        """Обработка введенных пользователем данных"""
        if not self._validate_input(text):
            await self._send_message(
                context=context,
                text=self.input_data.validation_failed_text,
            )
            return False

        # Сохраняем данные в контексте пользователя
        context.user_input[context.scenario_id][self.input_data.variable_name] = {
            "field_name": self.input_data.field_name,
            "field_type": self.input_data.field_type,
            "field_value": text,
        }

        # Сбрасываем флаг ожидания ввода
        self.reset_waiting_flag(context)

        return True

    def get_state(self, context: ScenarioContext) -> None:
        """Получает состояние сценария, создает если не существует"""
        if context.scenario_id not in context.user_input:
            context.user_input[context.scenario_id] = {}
        return None

    def set_waiting_flag(self, context: ScenarioContext) -> None:
        """Устанавливает флаг ожидания ввода"""
        context.user_input[context.scenario_id]["waiting"] = True

    def reset_waiting_flag(self, context: ScenarioContext) -> None:
        """Сбрасывает флаг ожидания ввода"""
        context.user_input[context.scenario_id].pop("waiting", None)

    def is_waiting(self, context: ScenarioContext) -> bool:
        """Проверяет, ожидается ли ввод"""
        return context.user_input[context.scenario_id].get("waiting", False)

    def is_already_filled(self, context: ScenarioContext) -> bool:
        """Проверяет, заполнено ли поле"""
        return (
            context.scenario_id in context.user_input
            and self.input_data.variable_name in context.user_input[context.scenario_id]
        )

    def _validate_input(self, text: str) -> bool:
        """Валидация введенных данных в зависимости от типа поля"""
        field_type = self.input_data.field_type

        if field_type == FieldType.PHONE.value:
            # Валидация телефона: цифры, +-(), пробелы, до 150 символов
            return (
                len(text) <= 150
                and re.fullmatch(r"^[\+\-0-9()\s]{1,150}$", text) is not None
            )

        elif field_type == FieldType.EMAIL.value:
            # Валидация email стандартного формата
            return bool(
                re.fullmatch(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", text)
            )

        elif field_type == FieldType.DATE.value:
            # Валидация даты в форматах dd.mm.yyyy или mm/dd/yyyy
            date_pattern = (
                r"^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$|"  # dd.mm.yyyy
                r"^(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])/\d{4}$"  # mm/dd/yyyy
            )
            if not re.match(date_pattern, text):
                return False

            try:
                if "." in text:
                    datetime.strptime(text, "%d.%m.%Y")
                else:
                    datetime.strptime(text, "%m/%d/%Y")
                return True
            except ValueError:
                return False

        elif field_type == FieldType.STRING.value:
            # Однострочный текст (1-255 символов)
            return 1 <= len(text.strip()) <= 255 and "\n" not in text

        elif field_type == FieldType.NUMBER.value:
            # Число (целое/дробное, со знаком или без)
            return bool(re.fullmatch(r"^[-+]?\d+(?:\.\d+)?$", text))

        elif field_type == FieldType.TEXT.value:
            # Многострочный текст (1-5000 символов)
            return 1 <= len(text.strip()) <= 5000

        elif field_type == FieldType.YES_NO.value:
            # Только "да" или "нет" (регистронезависимо)
            return text.lower() in {"да", "нет"}

        return True
