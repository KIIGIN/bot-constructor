from typing import Optional

from sqlalchemy import select, delete
from sqlalchemy.exc import IntegrityError

from app.core.dependencies.db_deps import AsyncSessionDI
from app.users.models import UserModel


class UserRepository:
    def __init__(self, session: AsyncSessionDI):
        self._session = session

    async def create_user(self, user_model: UserModel) -> Optional[UserModel]:
        try:
            self._session.add(user_model)
            await self._session.commit()
            await self._session.refresh(user_model)
        except IntegrityError:
            return
        return user_model

    async def get_user_model_by_email(self, email: str) -> Optional[UserModel]:
        user = await self._session.execute(
            select(UserModel)
            .where(UserModel.email == email)
        )
        return user.scalar_one_or_none()

    async def get_user_model_by_id(self, user_id: int) -> Optional[UserModel]:
        user = await self._session.execute(
            select(UserModel)
            .where(UserModel.id == user_id)
        )
        return user.scalar_one_or_none()

    async def delete_user_by_id(self, user_id: int) -> None:
        await self._session.execute(
            delete(UserModel)
            .where(UserModel.id == user_id)
        )
        await self._session.commit()
