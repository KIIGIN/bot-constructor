from typing import Annotated

from fastapi import Depends

from app.users.services import UserService

UserServiceDI = Annotated[UserService, Depends(UserService)]
