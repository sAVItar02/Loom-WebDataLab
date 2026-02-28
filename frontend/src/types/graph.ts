export type GraphNode = {
  id: string;
  url: string;
  domain: string;
  depth: number;
  pagerank: number;
};

export type GraphEdge = {
  source: string;
  target: string;
};

export type GraphResponse = {
  seed: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type PageRankGraphRequest = {
  url: string;
  max_hops: number;
  max_pages: number;
  same_domain_only: boolean;
};
