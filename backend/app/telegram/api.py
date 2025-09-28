from fastapi import APIRouter, Body, status
from aiogram.types import Update
from pydantic import ValidationError

from app.telegram.dependencies.manager_deps import TgBotManagerDI
from app.telegram.dependencies.storage_deps import StateStorageDI
from app.scenarios.dependencies.services_deps import ScenarioServiceDI
from app.bots.dependencies.services_deps import BotServiceDI
from app.users_data.dependencies.services_deps import UserDataServiceDI
from app.bots.exceptions.services_exceptions import BotNotFoundError
from app.telegram.context import ScenarioContext
from app.telegram.services.interpreter import ScenarioInterpreter
from app.telegram.storage.user_state import UserState
from app.telegram.handlers.start.start import handle_start
from app.telegram.handlers.callback import handle_callback
from app.users_data.schemas import UserFieldSchema

router = APIRouter(
    prefix="/telegram",
    tags=["Telegram"],
)


async def _restore_user_state(
    context: ScenarioContext,
    state_storage: StateStorageDI,
    user_data_service: UserDataServiceDI,
) -> None:
    """Восстановление состояния пользователя"""
    user_state = await state_storage.get_state(context.user_id)
    if user_state:
        context.current_block_id = user_state.current_block_id
        context.user_history = user_state.user_history

        if user_state.variables:
            context.user_input = user_state.variables
        elif context.scenario_id not in context.db_data_loaded:
            field = await user_data_service.get_field_by_scenario_id(
                int(context.scenario_id),
            )
            if field:
                context.user_input = {
                    field.variable: {
                        "field_name": field.name,
                        "field_type": field.type,
                        "field_value": field.values[0].value,
                        "saved": True,
                    }
                    for field in field.values
                    if field.user_id == context.user_id
                }
            context.db_data_loaded[context.scenario_id] = True


async def _save_user_state(
    context: ScenarioContext,
    state_storage: StateStorageDI,
) -> None:
    """Сохранение состояния пользователя"""
    await state_storage.set_state(
        UserState(
            user_id=context.user_id,
            scenario_id=context.scenario_id,
            current_block_id=context.current_block_id,
            variables=context.user_input,
            user_history=context.user_history,
            db_data_loaded=context.db_data_loaded,
        )
    )


async def _save_user_data(
    context: ScenarioContext,
    user_data_service: UserDataServiceDI,
) -> None:
    """Сохранение данных пользователя"""
    user_inputs = context.user_input.get(context.scenario_id, {})
    for variable, data in user_inputs.items():
        if isinstance(data, dict) and data.get("field_name") and not data.get("saved"):
            await user_data_service.save_user_data(
                UserFieldSchema(
                    name=data["field_name"],
                    type=data["field_type"],
                    value=data["field_value"],
                    scenario_id=int(context.scenario_id),
                    user_id=int(context.user_id),
                    username=context.username,
                    variable=variable,
                )
            )
            # Отмечаем, что данные сохранены
            data["saved"] = True


async def _handle_message_update(
    context: ScenarioContext,
) -> bool:
    """Обработка текстового сообщения"""
    # Проверяем, ожидаем ли мы ввод данных
    if context.scenario_id in context.user_input and context.user_input[
        context.scenario_id
    ].get("waiting", False):
        return True

    # Стандартная обработка
    restarted = await handle_start(context)
    if restarted:
        return True

    # Если сообщение не является триггером и нет текущего блока,
    # то игнорируем его
    return not bool(context.current_block_id)


async def _handle_callback_update(
    context: ScenarioContext,
) -> bool:
    """Обработка callback-запроса"""
    return await handle_callback(context)


async def _handle_update(context: ScenarioContext, update: Update) -> bool:
    """Обработка входящего апдейта"""
    if update.message:
        return await _handle_message_update(context)
    elif update.callback_query:
        return await _handle_callback_update(context)
    return False


@router.post(
    "/webhook/{bot_token}",
    status_code=status.HTTP_200_OK,
)
async def handle_webhook(
    bot_token: str,
    scenario_service: ScenarioServiceDI,
    user_data_service: UserDataServiceDI,
    bot_service: BotServiceDI,
    tg_bot_manager: TgBotManagerDI,
    state_storage: StateStorageDI,
    update: Update = Body(...),
):
    # Получение данных сценария
    scenario_model = await scenario_service.get_scenario_by_webhook_token(bot_token)

    # Создание бота и контекста
    decrypted_token = await bot_service.get_decrypted_token_by_webhook_token(bot_token)
    async with tg_bot_manager.create_bot(decrypted_token) as bot:
        context = await ScenarioContext.create(
            update=update,
            bot=bot,
            scenario_id=scenario_model.id,
            scenario_data=scenario_model.data,
        )

        # 1. Восстанавливаем состояние
        await _restore_user_state(context, state_storage, user_data_service)

        # 2. Обработка входящего апдейта
        should_process = await _handle_update(context, update)
        if not should_process:
            return

        # 3. Выполнение сценария
        interpreter = ScenarioInterpreter(context.scenario_data)
        await interpreter.execute(context)

        # 4. Сохранение данных
        await _save_user_data(context, user_data_service)

        # 5. Сохранение состояния
        await _save_user_state(context, state_storage)
