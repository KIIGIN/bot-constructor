from typing import Annotated

from fastapi import Depends

from app.scenarios.services import ScenarioService

ScenarioServiceDI = Annotated[ScenarioService, Depends(ScenarioService)]
