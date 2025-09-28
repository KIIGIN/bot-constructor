from typing import Annotated

from fastapi import Depends

from app.users_data.services import UserDataService

UserDataServiceDI = Annotated[UserDataService, Depends(UserDataService)]
