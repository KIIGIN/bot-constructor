from typing import Optional

from sqlalchemy import select, delete, update
from sqlalchemy.orm import selectinload

from app.core.dependencies.db_deps import AsyncSessionDI
from app.scenarios.models import ScenarioModel, TriggerModel
from app.bots.models import BotModel


class ScenarioRepository:
    def __init__(self, session: AsyncSessionDI):
        self._session = session

    async def create_scenario(self, scenario_model: ScenarioModel) -> Optional[ScenarioModel]:
        self._session.add(scenario_model)
        await self._session.commit()
        await self._session.refresh(scenario_model)
        
        return scenario_model

    async def get_scenarios_by_user_id(self, user_id: int) -> list[ScenarioModel]:
        scenarios = await self._session.execute(
            select(ScenarioModel)
            .options(
                selectinload(ScenarioModel.bot),
                selectinload(ScenarioModel.triggers),
                selectinload(ScenarioModel.fields),
            )
            .where(ScenarioModel.user_id == user_id)
        )
        return scenarios.scalars().all()

    async def get_scenario_model_by_id(self, scenario_id: int) -> Optional[ScenarioModel]:
        scenario = await self._session.execute(
            select(ScenarioModel)
            .options(
                selectinload(ScenarioModel.bot),
                selectinload(ScenarioModel.triggers),
                selectinload(ScenarioModel.fields),
            )
            .where(ScenarioModel.id == scenario_id)
        )
        return scenario.scalar_one_or_none()

    async def get_scenario_model_by_webhook_token(
            self, 
            webhook_token: str,
    ) -> Optional[ScenarioModel]:
        scenario = await self._session.execute(
            select(ScenarioModel)
            .join(ScenarioModel.bot)
            .options(
                selectinload(ScenarioModel.bot),
                selectinload(ScenarioModel.triggers),
            )
            .where(
                BotModel.webhook_token == webhook_token,
                ScenarioModel.enabled,
            )
        )
        return scenario.scalar_one_or_none()

    async def delete_scenario_by_id(self, scenario_id: int) -> None:
        await self._session.execute(
            delete(ScenarioModel)
            .where(ScenarioModel.id == scenario_id)
        )
        await self._session.commit()

    async def update_scenario_by_id(
            self,
            scenario_id: int,
            scenario_data: dict,
    ) -> ScenarioModel:
        scenario = await self.get_scenario_model_by_id(scenario_id)

        for field, value in scenario_data.items():
            if hasattr(scenario, field):
                setattr(scenario, field, value)

        await self._session.commit()
        await self._session.refresh(scenario)
        return scenario

    async def change_scenario_status_by_id(self, scenario_id: int, status: bool) -> None:
        await self._session.execute(
            update(ScenarioModel)
            .where(ScenarioModel.id == scenario_id)
            .values(enabled=status)
        )

    async def get_scenario_for_bot(
            self,
            scenario_id: int,
            bot_id: int,
    ) -> ScenarioModel:
        result = await self._session.execute(
            select(ScenarioModel)
            .where(
                ScenarioModel.id == scenario_id,
                ScenarioModel.bot_id == bot_id,
            )
        )
        return result.scalar_one_or_none()


class TriggerRepository:
    def __init__(self, session: AsyncSessionDI):
        self._session = session

    async def create_trigger(self, trigger_model: TriggerModel) -> Optional[TriggerModel]:
        self._session.add(trigger_model)
        await self._session.commit()
        await self._session.refresh(trigger_model)

        return trigger_model

    async def get_trigger_model_by_id(self, trigger_id: int) -> Optional[TriggerModel]:
        trigger = await self._session.execute(
            select(TriggerModel)
            .where(TriggerModel.id == trigger_id)
        )
        return trigger.scalar_one_or_none()
    
    async def update_trigger_by_id(
            self,
            trigger_id: int,
            trigger_data: dict,
    ) -> TriggerModel:
        trigger = await self.get_trigger_model_by_id(trigger_id)

        for field, value in trigger_data.items():
            if hasattr(trigger, field):
                setattr(trigger, field, value)

        await self._session.commit()
        await self._session.refresh(trigger)
        return trigger

    async def delete_trigger_by_id(self, trigger_id: int) -> None:
        await self._session.execute(
            delete(TriggerModel)
            .where(TriggerModel.id == trigger_id)
        )
        await self._session.commit()
