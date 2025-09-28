from typing import Annotated

from fastapi import Depends

from app.users.repositories import UserRepository

UserRepositoryDI = Annotated[UserRepository, Depends(UserRepository)]
