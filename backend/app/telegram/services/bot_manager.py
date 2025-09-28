from typing import Optional
from contextlib import asynccontextmanager

from aiogram import Bot, Dispatcher
from aiogram.types import Update
from aiogram.client.bot import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.exceptions import TelegramUnauthorizedError, TelegramBadRequest

from app.telegram.schemas.bot import BotInfo
from app.core.settings import settings


class TelegramBotManager:
    def __init__(self, webhook_base_url: str):
        self.webhook_base_url = webhook_base_url

    @asynccontextmanager
    async def create_bot(self, token: str):
        bot = Bot(
            token=token,
            default=DefaultBotProperties(parse_mode=ParseMode.HTML),
        )
        try:
            yield bot
        finally:
            await bot.session.close()

    async def is_token_valid(self, token: str) -> bool:
        async with self.create_bot(token) as bot:
            try:
                await bot.get_me()
                return True
            except TelegramUnauthorizedError:
                return False
            except Exception:
                return False

    async def get_info(self, token: str) -> Optional[BotInfo]:
        async with self.create_bot(token) as bot:
            try:
                bot_user = await bot.get_me()
                return BotInfo.model_validate(bot_user)
            except TelegramUnauthorizedError:
                return None

    async def process_update(self, token: str, update: Update) -> None:
        async with self.create_bot(token) as bot:
            dp = Dispatcher()
            await dp.feed_update(bot, update)

    async def set_webhook(self, token: str, hash_token: str) -> bool:
        async with self.create_bot(token) as bot:
            try:
                await bot.set_webhook(
                    f"{self.webhook_base_url}/api/telegram/webhook/{hash_token}",
                    drop_pending_updates=True,
                )
                return True
            except TelegramBadRequest:
                return False
            except Exception:
                return False

    async def delete_webhook(self, token: str) -> None:
        async with self.create_bot(token) as bot:
            try:
                await bot.delete_webhook(drop_pending_updates=True)
                return True
            except TelegramBadRequest:
                return False
            except Exception:
                return False


async def get_tg_bot_manager() -> TelegramBotManager:
    return TelegramBotManager(settings.app.WEBHOOK_URL)
