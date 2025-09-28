from typing import Annotated

from fastapi import Depends

from app.bots.repositories import BotRepository

BotRepositoryDI = Annotated[BotRepository, Depends(BotRepository)]
