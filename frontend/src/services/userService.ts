import { api } from "./api";
import { request } from "./request";
import type {
    ApiResponse,
    User,
    AuthData,
    Conversation,
    UserPreview,
    LoginPayload,
    RegisterPayload,
    ThirdPartyLoginPayload,
} from "../types/models";

export const thirdPartyLoginOrCreate = async (
    payload: ThirdPartyLoginPayload
): Promise<ApiResponse<AuthData>> => {
    return request<AuthData>(
        api.post("/users/auth/thirdparty", payload),
        "Error while logging in or creating user with third-party authentication."
    );
};

export const getUserByName = async (
    name: string
): Promise<ApiResponse<UserPreview[]>> => {
    return request<UserPreview[]>(
        api.get(`/users/profile/${name}`),
        "Error while fetching users by name."
    );
};

export const getUserByEmail = async (
    email: string
): Promise<ApiResponse<User>> => {
    return request<User>(
        api.get(`/users/emails/${email}`),
        "Error while fetching user by email."
    );
};

export const getUserById = async (
    userId: string
): Promise<ApiResponse<User>> => {
    return request<User>(
        api.get(`/users/profile/userId/${userId}`),
        "Error while fetching user by ID."
    );
};

export const updateLastSeen = async (): Promise<
    ApiResponse<{ message: string }>
> => {
    return request<{ message: string }>(
        api.patch(`/users/lastseen`),
        "Error while updating last seen time."
    );
};

export const getUserGroupConversations = async (): Promise<
    ApiResponse<Conversation[]>
> => {
    return request<Conversation[]>(
        api.get(`/users/conversations/group`),
        "Error while fetching user group conversations."
    );
};

export const getUserConversations = async (): Promise<
    ApiResponse<Conversation[]>
> => {
    return request<Conversation[]>(
        api.get(`/users/conversations`),
        "Error while fetching user conversations."
    );
};

export const getUserProfile = async (): Promise<ApiResponse<User>> => {
    return request<User>(
        api.get(`/users`),
        "Error while fetching user profile."
    );
};

export const updateUserProfile = async (
    payload: Partial<User> | FormData
): Promise<ApiResponse<User>> => {
    const isFormData = payload instanceof FormData;
    return request<User>(
        api.put(`/users`, payload, {
            headers: isFormData
                ? { "Content-Type": "multipart/form-data" }
                : { "Content-Type": "application/json" },
        }),
        "Error while updating user profile."
    );
};

export const login = async (
    payload: LoginPayload
): Promise<ApiResponse<AuthData>> => {
    return request<AuthData>(
        api.post(`/users/auth/login`, payload),
        "Error while logging in."
    );
};

export const register = async (
    payload: RegisterPayload
): Promise<ApiResponse<AuthData>> => {
    return request<AuthData>(
        api.post(`/users/auth/register`, payload),
        "Error while registering user."
    );
};
