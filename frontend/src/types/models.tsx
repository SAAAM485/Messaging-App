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
    isGroup: boolean;
    messages: Message[];
    participants: ConversationParticipant[];
}

export interface ConversationParticipant {
    id: string;
    conversationId: string;
    user: UserPreview;
    userId: string;
    lastReadAt?: Date;
}

interface UserPreview {
    id: string;
    name?: string;
    image?: string;
    motto?: string;
    lastSeen?: Date;
}
