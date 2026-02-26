from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class PageCreate(BaseModel):
    url: str
    selector: str
    mode: Optional[str] = "static"


class ScrapedElementResponse(BaseModel):
    tag_name: Optional[str] = None
    text_content: str
    detected_type: str
    numeric_value: Optional[float] = None
    date_value: Optional[datetime] = None


class PageResponse(BaseModel):
    id: int
    url: str
    selector: str
    mode: str
    elements: List[ScrapedElementResponse]

    class Config:
        from_attributes = True