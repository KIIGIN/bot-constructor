from fastapi import APIRouter, Depends, status, Response

from app.users.schemas import UserReadSchema
from app.auth.dependencies.auth_deps import UserIDFromAccessTokenDI, access_token_required
from app.users.dependencies.services_deps import UserServiceDI
from app.users.exceptions.http_exceptions import UnauthorizedHTTPException
from app.users.exceptions.services_exceptions import UserNotFoundError

router = APIRouter(
    prefix="/user",
    tags=["User"],
    dependencies=[Depends(access_token_required)],
)


@router.get(
    "",
    response_model=UserReadSchema,
)
async def get_user_info(
        user_id: UserIDFromAccessTokenDI,
        user_service: UserServiceDI,
):
    try:
        return await user_service.get_user_by_id(user_id)
    except UserNotFoundError:
        raise UnauthorizedHTTPException


@router.delete(
    "",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_user(
        user_id: UserIDFromAccessTokenDI,
        user_service: UserServiceDI,
        response: Response,
) -> None:
        await user_service.delete_user(user_id=user_id)

        # Удаляем куки при удалении пользователя
        response.delete_cookie(
            key="access_token",
            httponly=True,
            samesite="lax",
            secure=False,
        )
