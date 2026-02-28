from pydantic import BaseModel, HttpUrl
from typing import List, Optional

class GraphRequest(BaseModel):
    url: HttpUrl
    max_hops: int = 2
    max_pages: int = 300
    same_domain_only: bool = False

class GraphNode(BaseModel):
    id: str
    url: str
    domain: str
    depth: int
    pagerank: float

class GraphEdge(BaseModel):
    source: str
    target: str

class GraphResponse(BaseModel):
    seed: str
    nodes: List[GraphNode]
    edges: List[GraphEdge]