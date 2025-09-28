from app.users.models import UserModel
from app.users.schemas import UserReadSchema
from app.auth.schemas import RegisterCredentialsSchema, LoginCredentialsSchema
from app.users.exceptions.services_exceptions import UserAlreadyExistsError, UserNotFoundError
from app.auth.exceptions.services_exceptions import InvalidCredentialsError
from app.users.dependencies.repositories_deps import UserRepositoryDI
from app.users.dependencies.security_deps import PasswordManagerDI


class UserService:
    def __init__(
            self,
            user_repository: UserRepositoryDI,
            password_manager: PasswordManagerDI,
    ):
        self._user_repo = user_repository
        self._password_manager = password_manager

    async def create_user(
            self,
            credentials: RegisterCredentialsSchema,
    ) -> UserReadSchema:
        user_model = UserModel(
            email=credentials.email.lower(),
            hashed_password=self._password_manager.hash_password(credentials.password),
        )
        created_user = await self._user_repo.create_user(user_model)
        if not created_user:
            raise UserAlreadyExistsError     
           
        return UserReadSchema.model_validate(created_user)

    async def get_user_by_credentials(
            self,
            credentials: LoginCredentialsSchema,
    ) -> UserReadSchema:
        user = await self._user_repo.get_user_model_by_email(credentials.email)
        if not user or not self._password_manager.verify_password(
                credentials.password, user.hashed_password,
        ):
            raise InvalidCredentialsError
        return UserReadSchema.model_validate(user)

    async def get_user_by_id(self, user_id: int) -> UserReadSchema:
        user = await self._user_repo.get_user_model_by_id(user_id)
        if not user:
            raise UserNotFoundError
        return UserReadSchema.model_validate(user)

    async def delete_user(self, user_id: int) -> None:
        await self._user_repo.delete_user_by_id(user_id)
