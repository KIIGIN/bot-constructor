from typing import Annotated

from fastapi import Depends

from app.bots.services import BotService

BotServiceDI = Annotated[BotService, Depends(BotService)]
