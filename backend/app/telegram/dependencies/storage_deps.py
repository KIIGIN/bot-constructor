from typing import Annotated

from fastapi import Depends

from app.telegram.storage.state_storage import (
    BaseStateStorage,
    get_state_storage,
)

StateStorageDI = Annotated[BaseStateStorage, Depends(get_state_storage)]
