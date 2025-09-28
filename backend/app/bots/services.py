from typing import Optional

from app.bots.models import BotModel
from app.bots.schemas import (
    BotReadSchema,
    BotCreateSchema,
    BotPatchSchema,
    BotDefinitionSchema
)
from app.bots.utils import generate_webhook_token
from app.bots.exceptions.services_exceptions import (
    BotNotFoundError,
    NoPermissionForBotError,
    BotAlreadyUsedError,
    InvalidTelegramTokenError,
    BotAlreadyRunningError,
    BotNotRunningError,
)
from app.scenarios.exceptions.services_exceptions import (
    ScenarioNotFoundError,
    ScenarioTriggersDisabledError,
    ScenarioAlreadyRunningError,
    ScenarioNotRunningError,
)
from app.telegram.exceptions.manager_exceptions import (
    FailedToSetWebhookError,
    FailedToDeleteWebhookError,
)
from app.bots.dependencies.repositories_deps import BotRepositoryDI
from app.telegram.dependencies.manager_deps import TgBotManagerDI
from app.core.dependencies.security_deps import TokenCryptoDI
from app.scenarios.dependencies.repositories_deps import ScenarioRepositoryDI

class BotService:
    def __init__(
            self,
            bot_repository: BotRepositoryDI,
            scenario_repository: ScenarioRepositoryDI,
            tg_bot_manager: TgBotManagerDI,
            token_crypto: TokenCryptoDI,
    ):
        self._bot_repo = bot_repository
        self._scenario_repo = scenario_repository
        self._tg_manager = tg_bot_manager
        self._token_crypto = token_crypto

    async def add_bot(self, user_id: int, bot_data: BotCreateSchema) -> BotReadSchema:
        tg_info = await self._tg_manager.get_info(bot_data.token)
        if not tg_info or not tg_info.is_bot:
            raise InvalidTelegramTokenError

        encrypted_token = self._token_crypto.encrypt(bot_data.token)
        webhook_token = generate_webhook_token()

        bot_model = BotModel(
            user_id=user_id,
            encrypted_token=encrypted_token,
            webhook_token=webhook_token,
            first_name=tg_info.first_name,
            username=tg_info.username,
        )
        created_bot = await self._bot_repo.add_bot(bot_model)
        if not created_bot:
            raise BotAlreadyUsedError

        return BotReadSchema.model_validate(created_bot)

    async def get_bots(self, user_id: int) -> list[BotReadSchema]:
        bots = await self._bot_repo.get_bots_by_user_id(user_id)
        return [BotReadSchema.model_validate(bot) for bot in bots]

    async def get_bot_by_id(self, user_id: int, bot_id: int) -> BotReadSchema:
        bot = await self._bot_repo.get_bot_model_by_id(bot_id)
        if not bot:
            raise BotNotFoundError
        if bot.user_id != user_id:
            raise NoPermissionForBotError

        return BotReadSchema.model_validate(bot)

    async def get_decrypted_token_by_webhook_token(self, webhook_token: str) -> str:
        encrypted_token = await self._bot_repo.get_encrypted_token_by_webhook_token(webhook_token)
        if encrypted_token is None:
            raise BotNotFoundError

        return self._token_crypto.decrypt(encrypted_token)

    async def update_bot(
            self,
            user_id: int,
            bot_id: int,
            bot_data: BotPatchSchema,
    ) -> Optional[BotReadSchema]:
        _ = await self.get_bot_by_id(user_id=user_id, bot_id=bot_id)
        bot = await self._bot_repo.update_bot_by_id(
            bot_id=bot_id,
            bot_data=bot_data,
        )
        return BotReadSchema.model_validate(bot)

    async def delete_bot(self, user_id: int, bot_id: int) -> None:
        _ = await self.get_bot_by_id(user_id=user_id, bot_id=bot_id)
        await self._bot_repo.delete_bot_by_id(bot_id)

    async def deploy_bot(
            self,
            user_id: int,
            definition_data: BotDefinitionSchema,
    ) -> None:
        await self.get_bot_by_id(user_id, bot_id=definition_data.bot_id)

        bot = await self._bot_repo.get_bot_model_by_id(definition_data.bot_id)
        if bot.enabled:
            raise BotAlreadyRunningError

        token = self._token_crypto.decrypt(bot.encrypted_token)
        if not await self._tg_manager.is_token_valid(token):
            raise InvalidTelegramTokenError

        scenario = await self._scenario_repo.get_scenario_for_bot(
            scenario_id=definition_data.scenario_id,
            bot_id=definition_data.bot_id,
        )
        if not scenario:
            raise ScenarioNotFoundError
        if scenario.enabled:
            raise ScenarioAlreadyRunningError
        if not scenario.triggers:
            raise ScenarioTriggersDisabledError

        if not await self._tg_manager.set_webhook(token, bot.webhook_token):
            raise FailedToSetWebhookError

        await self._bot_repo.change_bot_status_by_id(bot.id, True)
        await self._scenario_repo.change_scenario_status_by_id(scenario.id, True)

    async def stop_bot(
            self,
            user_id: int,
            definition_data: BotDefinitionSchema,
    ) -> None:
        await self.get_bot_by_id(user_id, bot_id=definition_data.bot_id)

        bot = await self._bot_repo.get_bot_model_by_id(definition_data.bot_id)
        if not bot.enabled:
            raise BotNotRunningError

        token = self._token_crypto.decrypt(bot.encrypted_token)
        if not await self._tg_manager.is_token_valid(token):
            raise InvalidTelegramTokenError

        scenario = await self._scenario_repo.get_scenario_for_bot(
            scenario_id=definition_data.scenario_id,
            bot_id=definition_data.bot_id,
        )
        if not scenario:
            raise ScenarioNotFoundError
        if not scenario.enabled:
            raise ScenarioNotRunningError

        if not await self._tg_manager.delete_webhook(token):
            raise FailedToDeleteWebhookError

        await self._bot_repo.change_bot_status_by_id(bot.id, False)
        await self._scenario_repo.change_scenario_status_by_id(scenario.id, False)
