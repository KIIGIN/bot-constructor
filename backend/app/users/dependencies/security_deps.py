from typing import Annotated

from fastapi import Depends

from app.users.security.password import PasswordManager

PasswordManagerDI = Annotated[PasswordManager, Depends(PasswordManager)]
