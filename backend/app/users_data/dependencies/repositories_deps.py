from typing import Annotated

from fastapi import Depends

from app.users_data.repositories import UserFieldRepository, UserFieldValueRepository

UserFieldRepositoryDI = Annotated[UserFieldRepository, Depends(UserFieldRepository)]
UserFieldValueRepositoryDI = Annotated[
    UserFieldValueRepository, Depends(UserFieldValueRepository)
]
