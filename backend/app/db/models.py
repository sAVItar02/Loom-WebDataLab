from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

class ScrapeSession(Base): 
    __tablename__ = "scrape_sessions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    pages = relationship(
        "ScrapedPage",
        back_populates="session",
    )

class ScrapedPage(Base):
    __tablename__ = "scraped_pages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("scrape_sessions.id", ondelete="CASCADE"), nullable=False)
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

    id = Column(Integer, primary_key=True, index=True)
    page_id = Column(Integer, ForeignKey("scraped_pages.id", ondelete="CASCADE"), nullable=False)
    tag_name = Column(String)
    text_content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    page = relationship(
        "ScrapedPage",
        back_populates="elements"
    )


# INDEXES

Index("idx_scraped_pages_url", ScrapedPage.url)
Index("idx_scraped_pages_session_id", ScrapedPage.session_id)
Index("idx_scraped_elements_page_id", ScrapedElement.page_id)
