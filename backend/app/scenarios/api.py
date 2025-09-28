from fastapi import APIRouter, Depends, status, UploadFile, File

from app.auth.dependencies.auth_deps import UserIDFromAccessTokenDI, access_token_required
from app.scenarios.dependencies.services_deps import ScenarioServiceDI
from app.scenarios.exceptions.http_exceptions import (
    ScenarioNotFoundHTTPException,
    NoPermissionForScenarioHTTPException,
    EmptyFileHTTPException,
    FileTooLargeHTTPException,
)
from app.scenarios.exceptions.services_exceptions import (
    ScenarioNotFoundError,
    NoPermissionForScenarioError,
    EmptyFileError,
    FileTooLargeError,
)
from app.bots.exceptions.http_exceptions import (
    BotNotFoundHTTPException,
    NoPermissionForBotHTTPException,
)
from app.bots.exceptions.services_exceptions import (
    BotNotFoundError,
    NoPermissionForBotError,
)
from app.scenarios.schemas.scenario import (
    ScenarioReadSchema,
    ScenarioCreateSchema,
    ScenarioPatchSchema,
    ScenarioLinkSchema,
)

router = APIRouter(
    prefix="/scenario",
    tags=["Scenario"],
    dependencies=[Depends(access_token_required)],
)


@router.post(
    "",
    response_model=ScenarioReadSchema,
    status_code=status.HTTP_201_CREATED,
)
async def create_scenario(
        user_id: UserIDFromAccessTokenDI,
        scenario_service: ScenarioServiceDI,
        create_data: ScenarioCreateSchema,
):
    return await scenario_service.create_scenario(
        user_id=user_id,
        create_data=create_data,
    )


@router.post(
    "/{scenario_id}/bot",
    response_model=ScenarioReadSchema,
)
async def link_scenario_to_bot(
        user_id: UserIDFromAccessTokenDI,
        scenario_service: ScenarioServiceDI,
        scenario_id: int,
        link_data: ScenarioLinkSchema,
):
    try:
        return await scenario_service.link_scenario_to_bot(
            user_id=user_id,
            scenario_id=scenario_id,
            link_data=link_data,
        )
    except ScenarioNotFoundError:
        raise ScenarioNotFoundHTTPException
    except NoPermissionForScenarioError:
        raise NoPermissionForScenarioHTTPException
    except BotNotFoundError:
        raise BotNotFoundHTTPException
    except NoPermissionForBotError:
        raise NoPermissionForBotHTTPException


@router.get(
    "",
    response_model=list[ScenarioReadSchema],
)
async def get_scenarios(
        user_id: UserIDFromAccessTokenDI,
        scenario_service: ScenarioServiceDI,
):
    return await scenario_service.get_scenarios(user_id)


@router.get(
    "/{scenario_id}",
    response_model=ScenarioReadSchema,
)
async def get_scenario(
        user_id: UserIDFromAccessTokenDI,
        scenario_service: ScenarioServiceDI,
        scenario_id: int,
):
    try:
        return await scenario_service.get_scenario(
            user_id=user_id,
            scenario_id=scenario_id,
        )
    except ScenarioNotFoundError:
        raise ScenarioNotFoundHTTPException
    except NoPermissionForScenarioError:
        raise NoPermissionForScenarioHTTPException


@router.patch(
    "/{scenario_id}",
    response_model=ScenarioReadSchema,
)
async def patch_scenario(
        user_id: UserIDFromAccessTokenDI,
        scenario_service: ScenarioServiceDI,
        scenario_id: int,
        patch_data: ScenarioPatchSchema,
):
    try:
        return await scenario_service.patch_scenario(
            user_id=user_id,
            scenario_id=scenario_id,
            patch_data=patch_data,
        )
    except ScenarioNotFoundError:
        raise ScenarioNotFoundHTTPException
    except NoPermissionForScenarioError:
        raise NoPermissionForScenarioHTTPException


@router.delete(
    "/{scenario_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_scenario(
        user_id: UserIDFromAccessTokenDI,
        scenario_id: int,
        scenario_service: ScenarioServiceDI,
):
    try:
        await scenario_service.delete_scenario(
            user_id=user_id,
            scenario_id=scenario_id,
        )
    except ScenarioNotFoundError:
        raise ScenarioNotFoundHTTPException
    except NoPermissionForScenarioError:
        raise NoPermissionForScenarioHTTPException


@router.post("/attachment")
async def upload_user_file(
        user_id: UserIDFromAccessTokenDI,
        scenario_service: ScenarioServiceDI,
        file: UploadFile,
):
    try:
        file_data = await file.read()
        return await scenario_service.upload_user_file(
            user_id=user_id,
            file_data=file_data,
            content_type=file.content_type,
            filename=file.filename,
        )
    except EmptyFileError:
        raise EmptyFileHTTPException
    except FileTooLargeError:
        raise FileTooLargeHTTPException
    finally:
        await file.close()


@router.post(
    "/{scenario_id}/draft/apply",
    response_model=ScenarioReadSchema,
)
async def apply_draft(
        user_id: UserIDFromAccessTokenDI,
        scenario_service: ScenarioServiceDI,
        scenario_id: int,
):
    try:
        return await scenario_service.apply_draft(
            user_id=user_id,
            scenario_id=scenario_id,
        )
    except ScenarioNotFoundError:
        raise ScenarioNotFoundHTTPException
    except NoPermissionForScenarioError:
        raise NoPermissionForScenarioHTTPException
