from pathlib import Path
from slugify import slugify
from uuid import uuid4

from app.core.dependencies.s3_deps import S3ClientDI
from app.bots.dependencies.repositories_deps import BotRepositoryDI
from app.scenarios.dependencies.repositories_deps import ScenarioRepositoryDI, TriggerRepositoryDI
from app.scenarios.models import ScenarioModel, TriggerModel
from app.scenarios.schemas.scenario import (
    ScenarioCreateSchema,
    ScenarioPatchSchema,
    ScenarioLinkSchema,
    ScenarioReadSchema, 
    ScenarioDraftSchema,
)
from app.scenarios.exceptions.services_exceptions import (
    ScenarioNotFoundError,
    NoPermissionForScenarioError,
    EmptyFileError,
    FileTooLargeError,
)
from app.bots.exceptions.services_exceptions import (
    BotNotFoundError,
    NoPermissionForBotError,
)


class ScenarioService:
    def __init__(
            self,
            scenario_repository: ScenarioRepositoryDI,
            trigger_repository: TriggerRepositoryDI,
            bot_repository: BotRepositoryDI,
            client: S3ClientDI,
    ):
        self._scenario_repo = scenario_repository
        self._trigger_repo = trigger_repository
        self._bot_repo = bot_repository
        self._client = client

    async def create_scenario(
            self,
            user_id: int,
            create_data: ScenarioCreateSchema,
    ) -> ScenarioReadSchema:
        scenario_model = ScenarioModel(
            user_id=user_id,
            name=create_data.name,
            data=create_data.data,
        )
        created_scenario = await self._scenario_repo.create_scenario(scenario_model)

        return ScenarioReadSchema.model_validate(created_scenario)

    async def get_scenarios(self, user_id: int) -> list[ScenarioReadSchema]:
        scenarios = await self._scenario_repo.get_scenarios_by_user_id(user_id)
        return [ScenarioReadSchema.model_validate(scenario) for scenario in scenarios]

    async def get_scenario(
            self,
            user_id: int,
            scenario_id: int,
    ) -> ScenarioReadSchema:
        scenario = await self._scenario_repo.get_scenario_model_by_id(scenario_id)
        if scenario is None:
            raise ScenarioNotFoundError
        if scenario.user_id != user_id:
            raise NoPermissionForScenarioError
        return ScenarioReadSchema.model_validate(scenario)

    async def get_scenario_by_webhook_token(
            self,
            webhook_token: str,
    ) -> ScenarioReadSchema:
        scenario = await self._scenario_repo.get_scenario_model_by_webhook_token(webhook_token)
        if scenario is None:
            raise ScenarioNotFoundError
        return ScenarioReadSchema.model_validate(scenario)

    async def delete_scenario(self, user_id: int, scenario_id: int) -> None:
        _ = await self.get_scenario(user_id=user_id, scenario_id=scenario_id)
        await self._scenario_repo.delete_scenario_by_id(scenario_id)

    async def patch_scenario(
            self,
            user_id: int,
            scenario_id: int,
            patch_data: ScenarioPatchSchema,
    ) -> ScenarioReadSchema:
        _ = await self.get_scenario(user_id=user_id, scenario_id=scenario_id)

        update_data = patch_data.dict(exclude_unset=True)
        scenario = await self._scenario_repo.update_scenario_by_id(
            scenario_id=scenario_id,
            scenario_data=update_data,
        )
        return ScenarioReadSchema.model_validate(scenario)

    async def link_scenario_to_bot(
            self,
            user_id: int,
            scenario_id: int,
            link_data: ScenarioLinkSchema,
    ) -> ScenarioReadSchema:
        _ = await self.get_scenario(user_id=user_id, scenario_id=scenario_id)

        bot = await self._bot_repo.get_bot_model_by_id(bot_id=link_data.bot_id)
        if not bot:
            raise BotNotFoundError
        if bot.user_id != user_id:
            raise NoPermissionForBotError

        update_data = link_data.dict(exclude_unset=True)
        scenario = await self._scenario_repo.update_scenario_by_id(
            scenario_id=scenario_id,
            scenario_data=update_data,
        )
        return ScenarioReadSchema.model_validate(scenario)

    async def apply_draft(
            self,
            user_id: int,
            scenario_id: int,
    ) -> ScenarioReadSchema:
        scenario = await self.get_scenario(user_id=user_id, scenario_id=scenario_id)

        draft_data = ScenarioDraftSchema(data=scenario.draft)

        upd_scenario = await self._scenario_repo.update_scenario_by_id(
            scenario_id=scenario_id,
            scenario_data=draft_data.data
        )

        if upd_scenario.data and "blocks" in upd_scenario.data:
            blocks = upd_scenario.data["blocks"]

            for block in blocks:
                if block["type"] == "start" and "triggers" in block["data"]:
                    start_block = block

                    for trigger in upd_scenario.triggers:
                        await self._trigger_repo.delete_trigger_by_id(trigger.id)

                    for trigger in start_block["data"]["triggers"]:
                        if trigger["enabled"] == True:
                            trigger_model = TriggerModel(
                                scenario_id=scenario_id,
                                type=trigger["type"],
                                data=trigger["data"],
                                enabled=True
                            )
                            await self._trigger_repo.create_trigger(trigger_model)

                    break

        return ScenarioReadSchema.model_validate(upd_scenario)

    async def upload_user_file(
            self,
            user_id: int,
            file_data: bytes,
            content_type: str,
            filename: str,
    ) -> dict:
        if not file_data:
            raise EmptyFileError

        MAX_FILE_SIZE = 1024 * 1024 * 32
        if len(file_data) > MAX_FILE_SIZE:
            raise FileTooLargeError

        object_name = (f'{user_id}/chat-bot/attachments/{uuid4()}/'
                       f'{self.safe_filename(filename)}')

        metadata = await self._client.upload_file(
            file_data=file_data,
            object_name=object_name,
        )
        return {
            **metadata,
            "filename": filename,
            "content_type": content_type,
        }

    @staticmethod
    def safe_filename(filename: str, max_length: int = 255) -> str:
        name = Path(filename).name
        safe_name = slugify(name, lowercase=True, regex_pattern=r'[^-a-zа-яё0-9.]+')
        
        if len(safe_name) > max_length:
            name_parts = safe_name.rsplit('.', 1)
            if len(name_parts) > 1:
                extension = name_parts[1]
                name = name_parts[0][:max_length-len(extension)-1] + '.' + extension
            else:
                name = safe_name[:max_length]
                
        return name
