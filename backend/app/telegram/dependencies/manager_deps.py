from typing import Annotated

from fastapi import Depends

from app.telegram.services.bot_manager import get_tg_bot_manager, TelegramBotManager

TgBotManagerDI = Annotated[TelegramBotManager, Depends(get_tg_bot_manager)]
