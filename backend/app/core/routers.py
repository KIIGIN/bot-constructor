from fastapi import APIRouter

from app.telegram.api import router as telegram_router
from app.auth.api import router as auth_router
from app.users.api import router as users_router
from app.bots.api import router as bots_router
from app.scenarios.api import router as scenarios_router


def get_app_routers() -> APIRouter:
    app_routers = APIRouter(prefix="/api")

    routers = (
        telegram_router,
        auth_router,
        users_router,
        bots_router,
        scenarios_router,
    )

    for router in routers:
        app_routers.include_router(router)

    return app_routers
