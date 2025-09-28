from typing import Annotated

from fastapi import Depends

from app.scenarios.repositories import ScenarioRepository, TriggerRepository

ScenarioRepositoryDI = Annotated[ScenarioRepository, Depends(ScenarioRepository)]
TriggerRepositoryDI = Annotated[TriggerRepository, Depends(TriggerRepository)]
