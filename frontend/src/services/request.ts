import axios, { AxiosError, type AxiosResponse } from "axios";
import type { ApiResponse } from "../types/models";

export async function request<T>(
    axiosPromise: Promise<AxiosResponse<ApiResponse<T>>>,
    defaultErrorMsg: string = "An unexpected error occurred."
): Promise<ApiResponse<T>> {
    try {
        const response = await axiosPromise;
        return response.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            const axiosErr = err as AxiosError<ApiResponse<T>>;
            // 如果後端回傳標準格式
            if (axiosErr.response?.data) {
                return axiosErr.response.data;
            }
            // 否則自建一個錯誤回應
            return {
                success: false,
                error: {
                    code: axiosErr.response?.status.toString() || "AXIOS_ERROR",
                    message: axiosErr.response?.statusText || defaultErrorMsg,
                },
            };
        }
        // network or other unexpected errors
        console.error("Network or unexpected error:", err);
        return {
            success: false,
            error: {
                code: "NETWORK_ERROR",
                message: defaultErrorMsg,
            },
        };
    }
}
