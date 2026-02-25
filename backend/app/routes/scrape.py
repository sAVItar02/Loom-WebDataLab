from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import ScrapedPage, ScrapedElement, ScrapeSession
from app.schemas.scrape import ScrapeRequest, ScrapeResponse, ScrapedElementResponse
from app.services.scraper import scrape_static

router = APIRouter(prefix="/scrape", tags=["scrape"])


@router.post("/", response_model=ScrapeResponse)
def scrape(request: ScrapeRequest, db: Session = Depends(get_db)):
    session = db.query(ScrapeSession).filter(ScrapeSession.id == request.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    try:
        raw_results = scrape_static(request.url, request.selector)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Scraping failed: {str(e)}")

    import requests as req
    raw_html = req.get(request.url).text

    page = ScrapedPage(
        session_id=request.session_id,
        url=request.url,
        raw_html=raw_html,
        selector=request.selector,
        mode=request.mode or "static",
    )
    db.add(page)
    db.flush()

    elements = []
    for item in raw_results:
        el = ScrapedElement(
            page_id=page.id,
            tag_name=item["tag_name"],
            text_content=item["text_content"],
        )
        db.add(el)
        elements.append(ScrapedElementResponse(
            tag_name=item["tag_name"],
            text_content=item["text_content"],
            detected_type=item["detected_type"],
            numeric_value=item["numeric_value"],
            date_value=item["date_value"],
        ))

    db.commit()

    return ScrapeResponse(page_id=page.id, elements=elements)
