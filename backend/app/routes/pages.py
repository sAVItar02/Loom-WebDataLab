from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.db.session import get_db
from app.db.models import ScrapeSession, ScrapedPage, ScrapedElement
from app.schemas.scrape import ScrapeRequest, ScrapeResponse, ScrapedElementResponse
from app.services.scraper import scrape_static

router = APIRouter(prefix="/sessions/{session_id}/pages", tags=["pages"])

# Create & Scrape Page

@router.post("/", response_model=ScrapeResponse)
def create_page(session_id: UUID, payload: ScrapeRequest, db: Session = Depends(get_db)):
    session = db.query(ScrapeSession).filter(ScrapeSession.id == session_id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if payload.mode !== "static":
        raise HTTPException(status_code=400, detail="Only static mode is supported for now")

    elements_data = scrape_static(payload.url, payload.selector)

    new_page = ScrapedPage(
        session_id=session_id,
        url=payload.url,
        selector=payload.selector,
        mode="static",
        raw_html="",
    )

    db.add(new_page)
    db.flush()

    for el in elements_data:
        db.add(
            ScrapedElement(
                page_id=new_page.id,
                tag_name=el["tag_name"],
                text_content=el["text_content"],
                detected_type=el["detected_type"],
                numeric_value=el["numeric_value"],
                date_value=el["date_value"],
            )
        )
    
    db.commit()
    db.refresh(new_page)

    return ScrapeResponse(page_id=new_page.id, elements=[ScrapedElementResponse(**el) for el in elements_data])

# Get all pages for a session

@router.get("/", response_model=List[ScrapeResponse])
def get_pages(session_id: UUID, db: Session = Depends(get_db)):
    session = db.query(ScrapeSession).filter(ScrapeSession.id == session_id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    response = []

    for page in session.pages:
        elements = [
            ScrapedElementResponse(
                tag_name=element.tag_name,
                text_content=element.text_content,
                detected_type=element.detected_type,
                numeric_value=element.numeric_value,
                date_value=element.date_value,
            ) for element in page.elements
        ]
        response.append(ScrapeResponse(page_id=page.id, elements=elements))

    return response

# Get a single page

@router.get("/{page_id}", response_model=ScrapeResponse)
def get_page(session_id: UUID, page_id: UUID, db: Session = Depends(get_db)):
    page = db.query(ScrapedPage).filter(ScrapedPage.id == page_id, ScrapedPage.session_id == session_id).first()

    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    elements = [
        ScrapedElementResponse(
            tag_name=element.tag_name,
            text_content=element.text_content,
            detected_type=element.detected_type,
            numeric_value=element.numeric_value,
            date_value=element.date_value,
        ) for element in page.elements
    ]

    return ScrapeResponse(page_id=page.id, elements=elements)

# Delete a page

@router.delete("/{page_id}", response_model=dict)
def delete_page(session_id: UUID, page_id: UUID, db: Session = Depends(get_db)):
    page = db.query(ScrapedPage).filter(ScrapedPage.id == page_id, ScrapedPage.session_id == session_id).first()

    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    db.delete(page)
    db.commit()
    return {"message": "Page deleted successfully"}