import asyncio

import uvicorn as uvicorn

from contextlib import asynccontextmanager

from authx import AuthX
from authx.exceptions import JWTDecodeError, MissingTokenError

from fastapi import FastAPI, HTTPException, status
from fastapi.requests import Request
from fastapi.middleware.cors import CORSMiddleware

from app.core.settings import settings
from app.core.routers import get_app_routers


@asynccontextmanager
async def lifespan(app: FastAPI):
    auth_security = AuthX(config=settings.jwt.auth_config)
    auth_security.handle_errors(app)

    yield {"auth_security": auth_security}


app = FastAPI(title="ChatBot Constructor", lifespan=lifespan)
app.include_router(get_app_routers())


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(JWTDecodeError)
async def jwt_decode_exception_handler(request: Request, exc: JWTDecodeError):
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=exc.args[0],
    )


@app.exception_handler(MissingTokenError)
async def missing_access_token_exception_handler(
    request: Request, exc: MissingTokenError
):
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=exc.args[0],
    )


if __name__ == "__main__":
    config = uvicorn.Config(
        app,
        host="127.0.0.1",
        port=8000,
        reload=True,
        use_colors=True,
    )
    server = uvicorn.Server(config)

    asyncio.run(server.serve())
