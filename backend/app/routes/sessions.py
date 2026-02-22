from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import ScrapeSession

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("/")
def create_session(name: str, db: Session = Depends(get_db)):
    session = ScrapeSession(name=name)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session