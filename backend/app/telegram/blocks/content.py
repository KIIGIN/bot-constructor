from dataclasses import dataclass

from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

from app.telegram.blocks.base import BaseBlock, BlockDTO


@dataclass
class MenuButton:
    """Модель кнопки меню"""
    id: str
    text: str


@dataclass
class ContentData:
    text: str
    buttons: list[MenuButton]


class ContentBlock(BaseBlock):
    """Базовый класс для блоков с контентом"""
    DEFAULT_TEXT = "Сообщение"
    MAX_BUTTONS = 10

    def _build_keyboard(self, buttons: list[MenuButton]) -> InlineKeyboardMarkup:
        """Создание клавиатуры с кнопками"""
        keyboard = [
            [InlineKeyboardButton(text=btn.text, callback_data=btn.id)]
            for btn in buttons
        ]
        return InlineKeyboardMarkup(inline_keyboard=keyboard)

    def _prepare_content(self, dto: BlockDTO) -> ContentData:
        """Общая подготовка контента для всех блоков"""
        return ContentData(
            text=self._clean_text(dto.data.get("text", self.DEFAULT_TEXT)),
            buttons=self._prepare_buttons(dto.data.get("buttons", [])),
        )

    def _prepare_buttons(self, raw_buttons: list) -> list[MenuButton]:
        """Преобразование сырых данных кнопок в объекты MenuButton"""
        return [
            MenuButton(id=btn["id"], text=btn["text"])
            for btn in raw_buttons
            if all(key in btn for key in ["id", "text"])
        ][: self.MAX_BUTTONS]
