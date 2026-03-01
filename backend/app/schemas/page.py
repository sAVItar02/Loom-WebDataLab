from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import List, Optional
from uuid import UUID

class PageCreate(BaseModel):
    url: str
    selector: str
    mode: Optional[str] = "static"
    page_name: str = Field(alias="pageName")

    model_config = ConfigDict(populate_by_name=True)


class ScrapedElementResponse(BaseModel):
    tag_name: Optional[str] = None
    text_content: str
    detected_type: Optional[str] = None
    numeric_value: Optional[float] = None
    date_value: Optional[datetime] = None


class PageResponse(BaseModel):
    id: UUID
    url: str
    page_name: str
    selector: str
    mode: str
    raw_html: str
    created_at: datetime
    elements: List[ScrapedElementResponse]

    class Config:
        from_attributes = True

PageResponse.model_rebuild()
ScrapedElementResponse.model_rebuild()