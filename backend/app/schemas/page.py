from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from uuid import UUID

class PageCreate(BaseModel):
    url: str
    selector: str
    mode: Optional[str] = "static"


class ScrapedElementResponse(BaseModel):
    tag_name: Optional[str] = None
    text_content: str
    detected_type: Optional[str] = None
    numeric_value: Optional[float] = None
    date_value: Optional[datetime] = None


class PageResponse(BaseModel):
    id: UUID
    url: str
    selector: str
    mode: str
    elements: List[ScrapedElementResponse]

    class Config:
        from_attributes = True

PageResponse.model_rebuild()
ScrapedElementResponse.model_rebuild()