from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index, Float
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import uuid 
from sqlalchemy.dialects.postgresql import UUID

Base = declarative_base()

class ScrapeSession(Base): 
    __tablename__ = "scrape_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    pages = relationship(
        "ScrapedPage",
        back_populates="session",
        cascade="all, delete-orphan"
    )

class ScrapedPage(Base):
    __tablename__ = "scraped_pages"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("scrape_sessions.id", ondelete="CASCADE"), nullable=False)
    url = Column(String, nullable=False)
    raw_html = Column(Text, nullable=False)
    selector = Column(String, nullable=True)
    mode = Column(String, default="static")
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship(
        "ScrapeSession",
        back_populates="pages"
    )

    elements = relationship(
        "ScrapedElement",
        back_populates="page",
        cascade="all, delete-orphan"
    )

class ScrapedElement(Base):
    __tablename__ = "scraped_elements"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    page_id = Column(UUID(as_uuid=True), ForeignKey("scraped_pages.id", ondelete="CASCADE"), nullable=False)
    tag_name = Column(String)
    text_content = Column(Text)
    detected_type = Column(String, nullable=True)
    numeric_value = Column(Float, nullable=True)
    date_value = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    page = relationship(
        "ScrapedPage",
        back_populates="elements"
    )


# INDEXES

Index("idx_scraped_pages_url", ScrapedPage.url)
Index("idx_scraped_pages_session_id", ScrapedPage.session_id)
Index("idx_scraped_elements_page_id", ScrapedElement.page_id)
