from fastapi import FastAPI
from .db.session import engine
from .db.models import Base
from .core.config import settings
from .routes.sessions import router as sessions_router

app = FastAPI()

app.include_router(sessions_router)