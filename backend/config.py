from pydantic import BaseSettings

class Settings(BaseSettings):
    authjwt_secret_key: str = "atms-key"
    authjwt_access_token_expires: int = 3600
    authjwt_refresh_token_expires: int = 86400

settings = Settings()
