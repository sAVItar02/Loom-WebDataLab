import axios from "./axios";
import type { GraphResponse, PageRankGraphRequest } from "../types/graph";

export const getPageRankGraph = async (payload: PageRankGraphRequest) => {
  const response = await axios.post<GraphResponse>("/graph/pagerank", payload);
  return response.data;
};