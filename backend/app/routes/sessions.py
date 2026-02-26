from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import ScrapeSession
from app.schemas.session import SessionCreate, SessionResponse
from app.schemas.scrape import ScrapedElementResponse
from uuid import UUID
from fastapi import HTTPException
from typing import List

router = APIRouter(prefix="/sessions", tags=["sessions"])

# Session CRUD

@router.post("/", response_model=SessionResponse)
def create_session(session: SessionCreate, db: Session = Depends(get_db)):
    new_session = ScrapeSession(name=session.name)

    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@router.get("/", response_model=List[SessionResponse])
def get_sessions(db: Session = Depends(get_db)):
    sessions = db.query(ScrapeSession).order_by(ScrapeSession.created_at.desc()).all()
    return sessions

@router.get("/{session_id}", response_model=SessionResponse)
def get_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(ScrapeSession).filter(ScrapeSession.id == session_id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.delete("/{session_id}", response_model=dict)
def delete_session(session_id: UUID, db: Session = Depends(get_db)):
    session = db.query(ScrapeSession).filter(ScrapeSession.id == session_id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
    return {"message": "Session deleted successfully"}
