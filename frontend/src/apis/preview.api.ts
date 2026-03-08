import axios from "./axios";

export const getPreview = async (url: string) => {
    const response = await axios.get(`/preview?url=${url}`);
    return response.data;
}