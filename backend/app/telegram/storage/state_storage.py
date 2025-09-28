from abc import ABC, abstractmethod
from typing import Optional

from app.telegram.storage.user_state import UserState
from app.core.settings import settings


class BaseStateStorage(ABC):
    """Базовый класс для хранилища состояний пользователей"""
    
    @abstractmethod
    async def get_state(self, user_id: int) -> Optional[UserState]:
        """Получить состояние пользователя"""
        pass

    @abstractmethod
    async def set_state(self, state: UserState) -> None:
        """Установить состояние пользователя"""
        pass
    
    @abstractmethod
    async def delete_state(self, user_id: int) -> None:
        """Удалить состояние пользователя"""
        pass


class RedisStateStorage(BaseStateStorage):
    """Хранилище состояний пользователей в Redis"""
    
    def __init__(self, redis_client):
        self.redis = redis_client

    async def get_state(self, user_id: int) -> Optional[UserState]:
        """Получить состояние пользователя"""
        state = await self.redis.get(f"user:{user_id}:state")
        return UserState.model_validate_json(state) if state else None

    async def set_state(self, state: UserState) -> None:
        """Установить состояние пользователя"""
        await self.redis.set(
            f"user:{state.user_id}:state",
            state.model_dump_json(),
            ex=86400,  # 1 day
        )

    async def delete_state(self, user_id: int) -> None:
        """Удалить состояние пользователя"""
        await self.redis.delete(f"user:{user_id}:state")


async def get_state_storage() -> BaseStateStorage:
    """Получить хранилище состояний пользователей"""
    return RedisStateStorage(settings.redis.client)
