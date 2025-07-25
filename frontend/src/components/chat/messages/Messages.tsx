import styles from "./Messages.module.css";
import { useEffect, useState, useRef } from "react";
import { getMessagesByConversationId } from "../../../services/messageService";
import { markAsRead } from "../../../services/conversationService";
import { updateLastSeen } from "../../../services/userService";
import type { Conversation, Message } from "../../../types/models";
import { useRequireUser } from "../../../store/userRequireUser";

type Props = {
    conversation: Conversation;
    refreshToken: number;
};

const Messages = ({ conversation, refreshToken }: Props) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const conversationId = conversation.id;
    const user = useRequireUser();
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const fetchMessages = async (conversationId: string) => {
        setLoading(true);
        const res = await getMessagesByConversationId(conversationId);
        if (res.success && res.data) {
            setMessages(res.data);
            setError(null);
        } else {
            setError(res.error?.message || "Failed to load messages");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMessages(conversationId);
        markAsRead(conversationId);
    }, [conversationId, refreshToken]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchMessages(conversationId);
        }, 30000);
        return () => clearInterval(intervalId);
    }, [conversationId]);

    useEffect(() => {
        updateLastSeen(); // 進入頁面時立即更新
        const interval = setInterval(updateLastSeen, 600000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (loading) return <p>Loading messages...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className={styles.messageWrapper}>
            {messages.map((msg) =>
                msg.userId === user.id ? (
                    <div key={msg.id} className={styles.myMessage}>
                        {msg.imageUrl && (
                            <div className={styles.imgWrapper}>
                                {" "}
                                <img
                                    src={msg.imageUrl}
                                    alt="sent"
                                    className={styles.messageImage}
                                />
                            </div>
                        )}
                        {msg.content && (
                            <div className={styles.contentWrapper}>
                                <p>{msg.content}</p>
                            </div>
                        )}
                        <img
                            src={msg.user.image || "/default-avatar.png"}
                            alt={msg.user.name}
                            className={styles.avatar}
                        />
                    </div>
                ) : (
                    <div key={msg.id} className={styles.otherMessage}>
                        <img
                            src={msg.user.image || "/default-avatar.png"}
                            alt={msg.user.name}
                            className={styles.avatar}
                        />
                        {msg.imageUrl && (
                            <div className={styles.imgWrapper}>
                                {" "}
                                <img
                                    src={msg.imageUrl}
                                    alt="sent"
                                    className={styles.messageImage}
                                />
                            </div>
                        )}
                        {msg.content && (
                            <div className={styles.contentWrapper}>
                                <p>{msg.content}</p>
                            </div>
                        )}
                    </div>
                )
            )}
            <div ref={scrollRef} />
        </div>
    );
};

export default Messages;
