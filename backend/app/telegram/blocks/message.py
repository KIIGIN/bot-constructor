from typing import Optional, Type, Callable, Any
from dataclasses import dataclass
import aiohttp

from aiogram.types import BufferedInputFile
from aiogram.types import InputMediaPhoto, InputMediaVideo, InputMediaDocument, Message
from aiogram.methods import SendPhoto, SendVideo, SendDocument
from aiogram.exceptions import TelegramAPIError

from app.enums import AttachmentType, BlockConnectionPoint
from app.telegram.blocks.base import BaseBlock
from app.telegram.context import ScenarioContext


@dataclass
class Attachment:
    """Модель вложения"""
    url: str
    type: str
    filename: str
    caption: Optional[str] = None


class MessageBlock(BaseBlock):
    # Сопоставление типов медиа с классами InputMedia
    MEDIA_TYPE_MAPPING: dict[str, Type] = {
        "image/": InputMediaPhoto,
        "video/": InputMediaVideo,
        "application/": InputMediaDocument,
    }

    # Сопоставление типов медиа с методами отправки
    SEND_METHOD_MAPPING: dict[Type, Callable] = {
        InputMediaPhoto: SendPhoto,
        InputMediaVideo: SendVideo,
        InputMediaDocument: SendDocument,
    }

    async def execute(self, context: ScenarioContext) -> Optional[str]:
        return BlockConnectionPoint.NEXT.value
    
    async def on_entry(self, context: ScenarioContext) -> None:
        try:
            message_data = self._prepare_message_data()
            await self._send_text_message(context, message_data)
            return None
        except TelegramAPIError as e:
            await self._handle_error(context, e)
            return None

    def _prepare_message_data(self) -> dict[str, Any]:
        """Подготовка данных сообщения"""
        return {
            "text": self._clean_text(self.data.get("text", "Сообщение")),
            "type": self.data.get("type", ""),
            "attachments": [
                Attachment(url=att["url"], type=att["content_type"], filename=att["filename"])
                for att in self.data.get("attachments", [])
            ],
        }

    async def _send_text_message(
        self, context: ScenarioContext, message_data: dict[str, Any]
    ) -> None:
        """Отправка сообщения в зависимости от типа"""
        if not message_data["attachments"]:
            await self._send_message(context, message_data["text"])
            return
        elif message_data["type"] == AttachmentType.MEDIA.value:
            await self._handle_media_attachments(
                context, message_data["text"], message_data["attachments"]
            )
        elif message_data["type"] == AttachmentType.DOCUMENT.value:
            await self._handle_document_attachments(
                context, message_data["text"], message_data["attachments"]
            )

    async def _handle_media_attachments(
        self, context: ScenarioContext, text: str, attachments: list[Attachment]
    ) -> Message:
        """Обработка медиавложений (фото/видео)"""
        if len(attachments) > 1:
            media_group = await self._create_media_group(text, attachments)
            return await context.bot.send_media_group(
                chat_id=context.chat_id, media=media_group
            )
        return await self._send_single_media(context, text, attachments[0])

    async def _handle_document_attachments(
        self, context: ScenarioContext, text: str, attachments: list[Attachment]
    ) -> Message:
        """Обработка вложений документов"""
        if len(attachments) > 1:
            media_group = [
                InputMediaDocument(media=await self._download_media_from_url(att.url, att.filename), caption=text) for att in attachments
            ]
            return await context.bot.send_media_group(
                chat_id=context.chat_id, media=media_group
            )
        return await context.bot.send_document(
            chat_id=context.chat_id, document=attachments[0].url, caption=text
        )

    async def _create_media_group(self, text: str, attachments: list[Attachment]) -> list:
        """Создание медиагруппы с описанием для первого элемента"""
        return [
            self._get_media_type(att)(media=await self._download_media_from_url(att.url, att.filename), caption=text if i == 0 else None)
            for i, att in enumerate(attachments)
        ]

    def _get_media_type(self, attachment: Attachment) -> Type:
        """Определение типа медиа по MIME-типу"""
        for prefix, media_class in self.MEDIA_TYPE_MAPPING.items():
            if attachment.type.startswith(prefix):
                return media_class
        return InputMediaDocument

    @staticmethod
    async def _download_media_from_url(media_url, filename):
        async with aiohttp.ClientSession() as session:
            async with session.get(media_url) as resp:
                if resp.status != 200:
                    raise Exception(f"Image load failed: {resp.status}")
                media_bytes = await resp.read()
                media = BufferedInputFile(media_bytes, filename=filename)
                return media


    async def _send_single_media(
        self, context: ScenarioContext, text: str, attachment: Attachment
    ) -> Message:
        """Отправка одиночного медиафайла"""
        media_class = self._get_media_type(attachment)
        send_method = self.SEND_METHOD_MAPPING[media_class]

        media = await self._download_media_from_url(attachment.url, attachment.filename)

        return await context.bot(
            send_method(
                chat_id=context.chat_id,
                **{send_method.__name__.lower().split("send")[-1]: media},
                caption=text
            )
        )
