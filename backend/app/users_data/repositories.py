from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.dependencies.db_deps import AsyncSessionDI
from app.users_data.models import UserFieldModel, UserFieldValueModel


class UserFieldRepository:
    def __init__(self, session: AsyncSessionDI):
        self._session = session

    async def create_field(self, user_field: UserFieldModel) -> UserFieldModel:
        self._session.add(user_field)
        await self._session.commit()
        await self._session.refresh(user_field)
        return user_field

    async def get_field_by_scenario_id(
        self,
        scenario_id: int,
    ) -> Optional[UserFieldModel]:
        result = await self._session.execute(
            select(UserFieldModel)
            .options(selectinload(UserFieldModel.values))
            .where(UserFieldModel.scenario_id == scenario_id)
        )
        return result.scalar_one_or_none()


class UserFieldValueRepository:
    def __init__(self, session: AsyncSessionDI):
        self._session = session

    async def create_user_field_value(
        self,
        user_field_value: UserFieldValueModel,
    ) -> UserFieldValueModel:
        self._session.add(user_field_value)
        await self._session.commit()
        await self._session.refresh(user_field_value)
        return user_field_value
