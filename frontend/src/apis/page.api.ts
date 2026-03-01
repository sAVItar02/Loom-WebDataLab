import axios from "./axios";

export const getPages = async (sessionId: string) => {
    const response = await axios.get(`/sessions/${sessionId}/pages`);
    return response.data;
}

export const createPage = async (sessionId: string, url: string, selector: string, pageName: string) => {
    const response = await axios.post(`/sessions/${sessionId}/pages`, { url, selector, pageName });
    return response.data;
}