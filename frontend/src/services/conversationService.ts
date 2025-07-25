import { api } from "./api";
import { request } from "./request";
import type {
    ApiResponse,
    Conversation,
    ConversationParticipant,
} from "../types/models";

export const markAsRead = async (
    conversationId: string
): Promise<ApiResponse<ConversationParticipant>> => {
    return request<ConversationParticipant>(
        api.post(`/conversations/${conversationId}/read`),
        "Error while marking conversation as read."
    );
};

export const removeUserFromConversation = async (
    conversationId: string
): Promise<ApiResponse<ConversationParticipant[]>> => {
    return request<ConversationParticipant[]>(
        api.delete(`/conversations/${conversationId}/participants`),
        "Error while removing user from conversation."
    );
};

export const listParticipants = async (
    conversationId: string
): Promise<ApiResponse<ConversationParticipant[]>> => {
    return request<ConversationParticipant[]>(
        api.get(`/conversations/${conversationId}/participants`),
        "Error while listing conversation participants."
    );
};

export const addUserToConversation = async (
    conversationId: string,
    userId: string
): Promise<ApiResponse<Conversation>> => {
    return request<Conversation>(
        api.post(`/conversations/${conversationId}/participants`, {
            participantId: userId,
        }),
        "Error while adding user to conversation."
    );
};

export const getConversationById = async (
    conversationId: string
): Promise<ApiResponse<Conversation>> => {
    return request<Conversation>(
        api.get(`/conversations/${conversationId}`),
        "Error while fetching conversation by ID."
    );
};

export const findOrCreateConversation = async (payload: {
    participantId: string;
}): Promise<ApiResponse<Conversation>> => {
    return request<Conversation>(
        api.post(`/conversations/private`, payload),
        "Error while find or create conversation."
    );
};

export const postGroupConversation = async (payload: {
    name?: string;
    isGroup: boolean;
}): Promise<ApiResponse<Conversation>> => {
    return request<Conversation>(
        api.post(`/conversations/group`, payload),
        "Error while creating group conversation."
    );
};
