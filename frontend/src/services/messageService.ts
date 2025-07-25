import { api } from "./api";
import { request } from "./request";
import type { ApiResponse, Message } from "../types/models";

export const getMessagesByConversationId = async (
    conversationId: string
): Promise<ApiResponse<Message[]>> => {
    return request<Message[]>(
        api.get(`/messages/${conversationId}`),
        "Error while fetching messages by conversation ID."
    );
};

export const sendMessage = async (
    conversationId: string,
    content: string | File
): Promise<ApiResponse<Message>> => {
    const formData = new FormData();
    formData.append("conversationId", conversationId);

    if (typeof content === "string") {
        formData.append("content", content);
    } else {
        formData.append("image", content);
    }

    return request<Message>(
        api.post(`/messages/${conversationId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),
        "Failed to send message."
    );
};
