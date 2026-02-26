from fastapi import FastAPI
from .db.session import engine
from .db.models import Base
from .core.config import settings
from .routes.sessions import router as sessions_router
from .routes.pages import router as pages_router

app = FastAPI()

app.include_router(sessions_router)
app.include_router(pages_router)