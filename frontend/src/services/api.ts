import axios, { type AxiosRequestHeaders } from "axios";
import { useAuthStore } from "../store/useAuthStore";

export const api = axios.create({
    baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers = {
            ...(config.headers as AxiosRequestHeaders),
            Authorization: `Bearer ${token}`,
        } as AxiosRequestHeaders;
    }
    return config;
});
