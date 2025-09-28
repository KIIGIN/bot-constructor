from app.auth.schemas import RegisterCredentialsSchema, LoginCredentialsSchema
from app.auth.dependencies.auth_deps import AuthSecurityDI
from app.users.dependencies.services_deps import UserServiceDI


class AuthService:
    def __init__(
            self,
            auth_security: AuthSecurityDI,
            user_service: UserServiceDI,
    ):
        self._auth_security = auth_security
        self._user_service = user_service

    async def register(self, credentials: RegisterCredentialsSchema) -> dict:
        user = await self._user_service.create_user(credentials)
        return self.create_tokens(user.id)

    async def login(self, credentials: LoginCredentialsSchema) -> dict:
        user = await self._user_service.get_user_by_credentials(credentials)
        return self.create_tokens(user.id)

    def create_tokens(self, user_id: int) -> dict:
        access_token = self.create_access_token(user_id)
        refresh_token = self.create_refresh_token(user_id)
        return {"access_token": access_token, "refresh_token": refresh_token}

    def create_access_token(self, user_id: int) -> str:
        return self._auth_security.create_access_token(uid=str(user_id))

    def create_refresh_token(self, user_id: int) -> str:
        return self._auth_security.create_refresh_token(uid=str(user_id))

