from typing import Annotated

from fastapi import Depends

from app.core.security import (
    get_token_crypto, 
    TokenCrypto, 
)

TokenCryptoDI = Annotated[TokenCrypto, Depends(get_token_crypto)]
