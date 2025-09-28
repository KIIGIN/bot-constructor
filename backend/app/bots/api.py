from fastapi import APIRouter, Depends, status

from app.auth.dependencies.auth_deps import UserIDFromAccessTokenDI, access_token_required
from app.bots.dependencies.services_deps import BotServiceDI
from app.bots.schemas import BotReadSchema, BotCreateSchema, BotPatchSchema, BotDefinitionSchema
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
from app.bots.exceptions.http_exceptions import (
    BotNotFoundHTTPException,
    NoPermissionForBotHTTPException,
    BotAlreadyUsedHTTPException,
    InvalidTelegramTokenHTTPException,
    BotAlreadyRunningHTTPException,
    BotNotRunningHTTPException,
)
from app.scenarios.exceptions.http_exceptions import (
    ScenarioNotFoundHTTPException,
    ScenarioTriggersDisabledHTTPException,
    ScenarioAlreadyRunningHTTPException,
    ScenarioNotRunningHTTPException,
)
from app.telegram.exceptions.http_exceptions import (
    FailedToSetWebhookHTTPException,
    FailedToDeleteWebhookHTTPException,
)

router = APIRouter(
    prefix="/chat-bot",
    tags=["Chat-bots"],
    dependencies=[Depends(access_token_required)],
)


@router.post(
    "",
    response_model=BotReadSchema,
    status_code=status.HTTP_201_CREATED,
)
async def add_bot(
        user_id: UserIDFromAccessTokenDI,
        bot_data: BotCreateSchema,
        bot_service: BotServiceDI,
):
    try:
        return await bot_service.add_bot(
            user_id=user_id,
            bot_data=bot_data,
        )
    except InvalidTelegramTokenError:
        raise InvalidTelegramTokenHTTPException
    except BotAlreadyUsedError:
        raise BotAlreadyUsedHTTPException


@router.post("/definition/deploy")
async def deploy_bot(
        user_id: UserIDFromAccessTokenDI,
        definition_data: BotDefinitionSchema,
        bot_service: BotServiceDI,
):
    try:
        await bot_service.deploy_bot(
            user_id=user_id,
            definition_data=definition_data
        )
    except BotNotFoundError:
        raise BotNotFoundHTTPException
    except NoPermissionForBotError:
        raise NoPermissionForBotHTTPException
    except BotAlreadyRunningError:
        raise BotAlreadyRunningHTTPException
    except InvalidTelegramTokenError:
        raise InvalidTelegramTokenHTTPException
    except ScenarioNotFoundError:
        raise ScenarioNotFoundHTTPException
    except ScenarioAlreadyRunningError:
        raise ScenarioAlreadyRunningHTTPException
    except ScenarioTriggersDisabledError:
        raise ScenarioTriggersDisabledHTTPException
    except FailedToSetWebhookError:
        raise FailedToSetWebhookHTTPException
    except Exception:
        raise

    return {'status': 'ok'}


@router.post("/definition/stop")
async def stop_bot(
        user_id: UserIDFromAccessTokenDI,
        definition_data: BotDefinitionSchema,
        bot_service: BotServiceDI,
):
    try:
        await bot_service.stop_bot(
            user_id=user_id,
            definition_data=definition_data
        )
    except BotNotFoundError:
        raise BotNotFoundHTTPException
    except NoPermissionForBotError:
        raise NoPermissionForBotHTTPException
    except BotNotRunningError:
        raise BotNotRunningHTTPException
    except InvalidTelegramTokenError:
        raise InvalidTelegramTokenHTTPException
    except ScenarioNotFoundError:
        raise ScenarioNotFoundHTTPException
    except ScenarioNotRunningError:
        raise ScenarioNotRunningHTTPException
    except FailedToDeleteWebhookError:
        raise FailedToDeleteWebhookHTTPException
    except Exception:
        raise

    return {'status': 'ok'}


@router.get(
    "",
    response_model=list[BotReadSchema],
)
async def get_bots(
        bot_service: BotServiceDI,
        user_id: UserIDFromAccessTokenDI,
):
    return await bot_service.get_bots(user_id)


@router.patch(
    "/{bot_id}",
    response_model=BotReadSchema,
)
async def update_bot(
        bot_service: BotServiceDI,
        user_id: UserIDFromAccessTokenDI,
        bot_id: int,
        bot_data: BotPatchSchema,
):
    try:
        return await bot_service.update_bot(
            user_id=user_id,
            bot_id=bot_id,
            bot_data=bot_data
        )
    except BotNotFoundError:
        raise BotNotFoundHTTPException
    except NoPermissionForBotError:
        raise NoPermissionForBotHTTPException


@router.delete(
    "/{bot_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_bot(
        bot_service: BotServiceDI,
        user_id: UserIDFromAccessTokenDI,
        bot_id: int,
):
    try:
        await bot_service.delete_bot(user_id=user_id, bot_id=bot_id)
    except BotNotFoundError:
        raise BotNotFoundHTTPException
    except NoPermissionForBotError:
        raise NoPermissionForBotHTTPException
