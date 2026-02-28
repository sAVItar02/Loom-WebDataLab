from fastapi import APIRouter, HTTPException
from app.schemas.graph import GraphRequest, GraphResponse
from app.services.link_graph import build_graph_response

router = APIRouter(prefix="/graph", tags=["graph"])

@router.post("/pagerank", response_model=GraphResponse)
async def graph_pagerank(req: GraphRequest):
    if req.max_hops < 1 or req.max_hops > 3:
        raise HTTPException(status_code=400, detail="max_hops must be between 1 and 3")
    if req.max_pages < 10 or req.max_pages > 2000:
        raise HTTPException(status_code=400, detail="max_pages must be between 10 and 2000")

    seed, nodes, edges = await build_graph_response(
        seed_url=str(req.url),
        max_hops=req.max_hops,
        max_pages=req.max_pages,
        same_domain_only=req.same_domain_only,
    )
    return {"seed": seed, "nodes": nodes, "edges": edges}