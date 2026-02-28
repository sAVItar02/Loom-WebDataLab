from fastapi import FastAPI
from .db.session import engine
from .db.models import Base
from .core.config import settings
from .routes.sessions import router as sessions_router
from .routes.pages import router as pages_router
from .routes.graph import router as graph_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",  # Vite default
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions_router)
app.include_router(pages_router)
app.include_router(graph_router)