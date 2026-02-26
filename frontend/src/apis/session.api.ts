import axios from "./axios";

export const createSession = async (name: string) => {
    const response = await axios.post("/sessions", { name });
    return response.data;
}

export const getSessions = async () => {
    const response = await axios.get("/sessions");
    return response.data;
}

export const getSession = async (id: string) => {
    const response = await axios.get(`/sessions/${id}`);
    return response.data;
}