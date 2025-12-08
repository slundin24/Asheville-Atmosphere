# SECRET_KEY = "atms-key"
# ALGORITHM = "HS256"
# ACCESS_TOKEN_EXPIRE_MINUTES = 60
# DATABASE_URL = "sqlite:///./test.db"

from pydantic import BaseSettings

class Settings(BaseSettings):
    authjwt_secret_key: str = "SUPERSECRET"  # change this
    authjwt_access_token_expires: int = 3600
    authjwt_refresh_token_expires: int = 86400

settings = Settings()
