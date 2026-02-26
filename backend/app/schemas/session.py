from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional

class SessionCreate(BaseModel): 
    name: str

class SessionResponse(BaseModel): 
    id: UUID
    name: str
    created_at: datetime
    page_count: int = 0
    elements_extracted: int = 0
    last_scraped_at: Optional[datetime]

    class Config:
        from_attributes = True

SessionResponse.model_rebuild()

        