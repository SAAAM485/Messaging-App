import { api } from "./api";
import { request } from "./request";
import type { ApiResponse, Friend, UserPreview } from "../types/models";

export const getFriendship = async (
    friendId: string
): Promise<ApiResponse<Friend | null>> => {
    return request<Friend>(
        api.get(`/friends/friendships/${friendId}`),
        "Error while fetching friendship details."
    );
};

export const sendFriendRequest = async (
    friendId: string
): Promise<ApiResponse<Friend>> => {
    return request<Friend>(
        api.post(`/friends/friendships/${friendId}`),
        "Error while sending friend request."
    );
};

export const getAllAcceptedFriendship = async (): Promise<
    ApiResponse<UserPreview[]>
> => {
    return request<UserPreview[]>(
        api.get(`/friends/friendships`),
        "Error while fetching all accepted friends."
    );
};

export const confirmFriendRequest = async (
    requestId: string
): Promise<ApiResponse<Friend>> => {
    return request<Friend>(
        api.patch(`/friends/requests/${requestId}`),
        "Error while confirming friend request."
    );
};

export const deleteFriendRequest = async (
    requestId: string
): Promise<ApiResponse<{ message: string }>> => {
    return request<{ message: string }>(
        api.delete(`/friends/requests/${requestId}`),
        "Error while deleting friend request."
    );
};

export const getAllSentRequests = async (): Promise<ApiResponse<Friend[]>> => {
    return request<Friend[]>(
        api.get(`/friends/requests/sent`),
        "Error while fetching all sent friend requests."
    );
};

export const getAllReceivedRequests = async (): Promise<
    ApiResponse<Friend[]>
> => {
    return request<Friend[]>(
        api.get(`/friends/requests`),
        "Error while fetching all received friend requests."
    );
};

export const getLastSeenFriends = async (): Promise<
    ApiResponse<UserPreview[]>
> => {
    return request<UserPreview[]>(
        api.get(`/friends/lastseen`),
        "Error while fetching last seen friends."
    );
};
