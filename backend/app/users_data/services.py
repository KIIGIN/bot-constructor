from typing import Optional

from app.users_data.dependencies.repositories_deps import (
    UserFieldRepositoryDI,
    UserFieldValueRepositoryDI,
)
from app.users_data.schemas import (
    UserFieldCreateSchema,
    UserFieldReadSchema,
    UserFieldValueCreateSchema,
    UserFieldValueReadSchema,
    UserFieldSchema,
)
from app.users_data.models import UserFieldModel, UserFieldValueModel


class UserDataService:
    def __init__(
        self,
        field_repository: UserFieldRepositoryDI,
        value_repository: UserFieldValueRepositoryDI,
    ):
        self._field_repo = field_repository
        self._value_repo = value_repository

    async def get_field_by_scenario_id(
        self,
        scenario_id: int,
    ) -> UserFieldReadSchema:
        field = await self._field_repo.get_field_by_scenario_id(scenario_id)
        if not field:
            return None
        return UserFieldReadSchema.model_validate(field)

    async def save_user_data(
        self,
        user_data: UserFieldSchema,
    ) -> None:
        """Сохранение данных пользователя"""
        # Получаем или создаем поле
        field = await self._get_or_create_field(
            field_data=UserFieldCreateSchema(
                name=user_data.name,
                type=user_data.type,
                variable=user_data.variable,
                scenario_id=user_data.scenario_id,
            ),
        )

        # Сохраняем значение поля
        await self._create_field_value(
            value_data=UserFieldValueCreateSchema(
                user_id=user_data.user_id,
                username=user_data.username,
                field_id=field.id,
                value=user_data.value,
            ),
        )

    async def _get_or_create_field(
        self,
        field_data: UserFieldCreateSchema,
    ) -> UserFieldReadSchema:
        field = await self._field_repo.get_field_by_scenario_id(
            scenario_id=field_data.scenario_id,
        )
        if field:
            return field
        return await self._create_field(field_data)

    async def _create_field(
        self,
        field_data: UserFieldCreateSchema,
    ) -> UserFieldReadSchema:
        new_field = UserFieldModel(
            name=field_data.name,
            type=field_data.type,
            variable=field_data.variable,
            scenario_id=field_data.scenario_id,
        )
        field = await self._field_repo.create_field(new_field)
        return UserFieldReadSchema.model_validate(field)

    async def _create_field_value(
        self,
        value_data: UserFieldValueCreateSchema,
    ) -> UserFieldValueReadSchema:
        new_value = UserFieldValueModel(
            user_id=value_data.user_id,
            username=value_data.username,
            field_id=value_data.field_id,
            value=value_data.value,
        )
        value = await self._value_repo.create_user_field_value(new_value)
        return UserFieldValueReadSchema.model_validate(value)
