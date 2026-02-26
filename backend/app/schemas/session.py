from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class SessionCreate(BaseModel): 
    name: str

class SessionResponse(BaseModel): 
    id: UUID
    name: str
    created_at: datetime

    class Config:
        from_attributes = True

        