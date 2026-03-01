from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import ScrapeSession, ScrapedPage, ScrapedElement
from app.schemas.page import PageCreate, PageResponse, ScrapedElementResponse
from app.services.scraper import scrape_static
import requests
from uuid import UUID

router = APIRouter(tags=["pages"])


@router.post("/sessions/{session_id}/pages", response_model=PageResponse)
def create_page_and_scrape(
    session_id: UUID,
    payload: PageCreate,
    db: Session = Depends(get_db),
):
    session = db.query(ScrapeSession).filter(
        ScrapeSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    try:
        raw_results = scrape_static(payload.url, payload.selector)
        raw_html = requests.get(payload.url).text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Scraping failed: {str(e)}")

    page = ScrapedPage(
        session_id=session_id,
        url=payload.url,
        selector=payload.selector,
        raw_html=raw_html,
        mode=payload.mode or "static",
    )

    db.add(page)
    db.flush() 

    elements_response = []

    for item in raw_results:
        element = ScrapedElement(
            page_id=page.id,
            tag_name=item["tag_name"],
            text_content=item["text_content"],
            detected_type=item["detected_type"],
            numeric_value=item["numeric_value"],
            date_value=item["date_value"],
        )

        db.add(element)

        elements_response.append(
            ScrapedElementResponse(
                tag_name=item["tag_name"],
                text_content=item["text_content"],
                detected_type=item["detected_type"],
                numeric_value=item["numeric_value"],
                date_value=item["date_value"],
            )
        )

    db.commit()

    return PageResponse(
        id=page.id,
        url=page.url,
        selector=page.selector,
        mode=page.mode,
        elements=elements_response,
    )


@router.get("/sessions/{session_id}/pages", response_model=list[PageResponse])
def get_pages_for_session(session_id: UUID, db: Session = Depends(get_db)):
    pages = db.query(ScrapedPage).filter(
        ScrapedPage.session_id == session_id
    ).all()

    return pages


@router.get("/pages/{page_id}", response_model=PageResponse)
def get_page(page_id: UUID, db: Session = Depends(get_db)):
    page = db.query(ScrapedPage).filter(
        ScrapedPage.id == page_id
    ).first()

    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    return page


@router.delete("/pages/{page_id}")
def delete_page(page_id: UUID, db: Session = Depends(get_db)):
    page = db.query(ScrapedPage).filter(
        ScrapedPage.id == page_id
    ).first()

    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    db.delete(page)
    db.commit()

    return {"message": "Page deleted"}