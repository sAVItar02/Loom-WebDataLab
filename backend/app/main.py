from fastapi import FastAPI
from .db.session import engine
from .db.models import Base
from .core.config import settings

app = FastAPI()