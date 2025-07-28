import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./ChatPage.module.css";
import ChatHeader from "../../components/chat/chatHeader/ChatHeader";
import Messages from "../../components/chat/messages/Messages";
import ChatInput from "../../components/chat/chatInput/ChatInput";
import { getConversationById } from "../../services/conversationService";
import type { Conversation } from "../../types/models";

export default function ChatPage() {
    const { conversationId } = useParams<{ conversationId: string }>();
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [messageRefreshToken, setMessageRefreshToken] = useState(0);
    const [conversationRefreshToken, setConversationRefreshToken] = useState(0);

    const refreshMessages = () => {
        setMessageRefreshToken((prev) => prev + 1);
    };

    const refreshConversation = () => {
        setConversationRefreshToken((prev) => prev + 1);
    };

    useEffect(() => {
        if (!conversationId) return;
        const fetchConversation = async () => {
            setLoading(true);
            const res = await getConversationById(conversationId);
            if (res.success && res.data) {
                setConversation(res.data);
                setError(null);
            } else {
                setError(res.error?.message || "Failed to load conversation");
            }
            setLoading(false);
        };
        fetchConversation();
    }, [conversationId, conversationRefreshToken]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!conversation) return <p>Conversation not found</p>;

    return (
        <div className={styles.chatPage}>
            <ChatHeader conversation={conversation} />
            <Messages
                conversation={conversation}
                refreshToken={messageRefreshToken}
            />
            <ChatInput conversation={conversation} onSend={refreshMessages} />
        </div>
    );
}
