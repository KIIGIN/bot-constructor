from fastapi import APIRouter, Response, status, Request, HTTPException

from app.auth.dependencies.services_deps import AuthServiceDI
from app.auth.dependencies.auth_deps import AuthSecurityDI
from app.auth.schemas import RegisterCredentialsSchema, LoginCredentialsSchema
from app.auth.exceptions.http_exceptions import InvalidCredentialsHTTPException
from app.auth.exceptions.services_exceptions import InvalidCredentialsError
from app.users.exceptions.http_exceptions import UserAlreadyExistsHTTPException
from app.users.exceptions.services_exceptions import UserAlreadyExistsError

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    credentials: RegisterCredentialsSchema,
    auth_service: AuthServiceDI,
):
    try:
        tokens = await auth_service.register(credentials)
    except UserAlreadyExistsError:
        raise UserAlreadyExistsHTTPException

    return {"detail": "Registration successful"}


@router.post("/login")
async def login(
    credentials: LoginCredentialsSchema,
    auth_service: AuthServiceDI,
    response: Response,
):
    try:
        tokens = await auth_service.login(credentials)
    except InvalidCredentialsError:
        raise InvalidCredentialsHTTPException

    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        httponly=True,
        samesite="lax",
        secure=False,
    )
    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        samesite="lax",
        secure=False,
    )

    return {"detail": "Login successful"}


@router.post("/refresh")
async def refresh(
    response: Response,
    request: Request,
    auth_service: AuthServiceDI,
    auth_security: AuthSecurityDI,
):
    try:
        refresh_payload = await auth_security.refresh_token_required(request)

        if not refresh_payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No refresh token provided",
            )

        new_access_token = auth_service.create_access_token(refresh_payload.sub)

        response.set_cookie(
            key="access_token",
            value=new_access_token,
            httponly=True,
            samesite="lax",
            secure=False,
        )

        return {"detail": "Token refreshed successfully"}

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/logout")
async def logout(
    response: Response,
):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        samesite="lax",
        secure=False,
    )
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        samesite="lax",
        secure=False,
    )

    return {"detail": "Logout successful"}
