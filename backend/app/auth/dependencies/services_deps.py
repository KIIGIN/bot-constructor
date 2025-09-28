from typing import Annotated

from fastapi import Depends

from app.auth.services import AuthService

AuthServiceDI = Annotated[AuthService, Depends(AuthService)]
