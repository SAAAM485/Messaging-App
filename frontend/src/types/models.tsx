export interface User {
    id: string;
    name?: string;
    image?: string;
    motto?: string;
    bio?: string;
    lastSeen?: Date;
    conversations: ConversationParticipant[];
}

export interface Friend {
    id: string;
    status: string;
    user?: UserPreview;
    userId: string;
    friend?: UserPreview;
    friendId: string;
}

export interface Message {
    id: string;
    content?: string;
    imageUrl?: string;
    sentAt: Date;
    conversationId: string;
    user: UserPreview;
    userId: string;
}

export interface Conversation {
    id: string;
    name?: string;
    unreadCount: number;
    lastReadAt?: Date | null;
    isGroup: boolean;
    messages: Message[];
    participants: ConversationParticipant[];
}

export interface ConversationParticipant {
    id: string;
    conversationId: string;
    user: UserPreview;
    lastReadAt?: Date;
}

export interface UserPreview {
    id: string;
    name?: string;
    image?: string;
    motto?: string;
    lastSeen?: Date;
}

export interface AuthData {
    user: UserPreview;
    token: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}

export interface ThirdPartyLoginPayload {
    credential: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}
