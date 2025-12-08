from fastapi import Depends, HTTPException
from fastapi_jwt_auth import AuthJWT
from fastapi_jwt_auth.exceptions import AuthJWTException
from fastapi.responses import JSONResponse
from .config import settings

# Load JWT settings
@AuthJWT.load_config
def get_config():
    return settings

# Exception handler required by fastapi-jwt-auth
def jwt_exception_handler(_, exc: AuthJWTException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message}
    )
