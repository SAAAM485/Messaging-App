import axios, { type AxiosRequestHeaders } from "axios";
import { useAuthStore } from "../store/useAuthStore";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const api = axios.create({
    baseURL: `${BASE_URL}/api`,
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
