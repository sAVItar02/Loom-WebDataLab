from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.db.models import ScrapeSession, ScrapedPage, ScrapedElement
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
    sessions_with_counts = (
        db.query(ScrapeSession, 
            func.count(ScrapedPage.id).label("page_count"), 
            func.count(ScrapedElement.id).label("elements_extracted"),
            func.max(ScrapedPage.created_at).label("last_scraped_at")
        )
        .outerjoin(ScrapedPage, ScrapedPage.session_id == ScrapeSession.id)
        .outerjoin(ScrapedElement, ScrapedElement.page_id == ScrapedPage.id)
        .group_by(ScrapeSession.id)
        .order_by(ScrapeSession.created_at.desc())
        .all()
    )

    sessions = []
    for session, page_count, elements_extracted, last_scraped_at in sessions_with_counts:
        session.page_count = page_count
        session.elements_extracted = elements_extracted
        session.last_scraped_at = last_scraped_at
        sessions.append(SessionResponse.model_validate(session).model_dump())

    return sessions

@router.get("/{session_id}", response_model=SessionResponse)
def get_session(session_id: UUID, db: Session = Depends(get_db)):
    session = db.query(ScrapeSession).filter(ScrapeSession.id == session_id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return SessionResponse.model_validate({
        "id": session.id,
        "name": session.name,
        "created_at": session.created_at,
        "page_count": getattr(session, "page_count", 0),            # default to 0
        "elements_extracted": getattr(session, "elements_extracted", 0),
        "last_scraped_at": getattr(session, "last_scraped_at", None),
    }).model_dump()

@router.delete("/{session_id}", response_model=dict)
def delete_session(session_id: UUID, db: Session = Depends(get_db)):
    session = db.query(ScrapeSession).filter(ScrapeSession.id == session_id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
    return {"message": "Session deleted successfully"}
