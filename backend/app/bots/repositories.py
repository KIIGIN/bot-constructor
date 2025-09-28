from typing import Optional

from sqlalchemy import select, delete, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload

from app.scenarios.models import ScenarioModel
from app.bots.models import BotModel
from app.bots.schemas import BotPatchSchema
from app.core.dependencies.db_deps import AsyncSessionDI


class BotRepository:
    def __init__(self, session: AsyncSessionDI):
        self._session = session

    async def add_bot(self, bot_model: BotModel) -> Optional[BotModel]:
        try:
            self._session.add(bot_model)
            await self._session.commit()
            await self._session.refresh(bot_model)
        except IntegrityError:
            return
        return bot_model

    async def get_bots_by_user_id(self, user_id: int) -> list[BotModel]:
        result = await self._session.execute(
            select(BotModel)
            .options(
                selectinload(BotModel.scenarios)
                .joinedload(ScenarioModel.triggers),
            )
            .where(BotModel.user_id == user_id)
        )
        return result.scalars().all()

    async def get_bot_model_by_id(self, bot_id: int) -> Optional[BotModel]:
        result = await self._session.execute(
            select(BotModel)
            .options(
                selectinload(BotModel.scenarios)
                .joinedload(ScenarioModel.triggers),
            )
            .where(BotModel.id == bot_id)
        )
        return result.scalar_one_or_none()

    async def get_encrypted_token_by_webhook_token(self, webhook_token: str) -> Optional[str]:
        result = await self._session.execute(
            select(BotModel.encrypted_token)
            .where(BotModel.webhook_token == webhook_token)
        )
        return result.scalar_one_or_none()

    async def update_bot_by_id(
            self,
            bot_id: int,
            bot_data: BotPatchSchema,
    ) -> Optional[BotModel]:
        bot = await self.get_bot_model_by_id(bot_id)

        for field, value in bot_data.dict(exclude_unset=True).items():
            if hasattr(bot, field):
                setattr(bot, field, value)

        await self._session.commit()
        await self._session.refresh(bot)
        return bot

    async def delete_bot_by_id(self, bot_id: int) -> None:
        await self._session.execute(
            delete(BotModel)
            .where(BotModel.id == bot_id)
        )
        await self._session.commit()

    async def change_bot_status_by_id(self, bot_id: int, status: bool) -> None:
        await self._session.execute(
            update(BotModel)
            .where(BotModel.id == bot_id)
            .values(enabled=status)
        )
