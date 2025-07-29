import styles from "./Messages.module.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getMessagesByConversationId } from "../../../services/messageService";
import { markAsRead } from "../../../services/conversationService";
import { updateLastSeen } from "../../../services/userService";
import type { Conversation, Message } from "../../../types/models";
import { useAuthStore } from "../../../store/useAuthStore";
import { getImageSrc } from "../../../utils/imageUtils";

type Props = {
    conversation: Conversation;
    refreshToken: number;
};

const Messages = ({ conversation, refreshToken }: Props) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const conversationId = conversation.id;
    const currentUser = useAuthStore((s) => s.user);
    const navigate = useNavigate();
    const messageContainerRef = useRef<HTMLDivElement | null>(null); // 修改為訊息容器的參考

    const fetchMessages = async (conversationId: string, initial = false) => {
        if (initial) setLoading(true);
        const res = await getMessagesByConversationId(conversationId);
        if (res.success && res.data) {
            setMessages(res.data);
            setError(null);
        } else {
            setError(res.error?.message || "Failed to load messages");
        }
        if (initial) setLoading(false);
    };

    useEffect(() => {
        if (!currentUser) {
            navigate("/login");
            return;
        }

        fetchMessages(conversationId, true);
        markAsRead(conversationId);
    }, [conversationId, refreshToken, currentUser, navigate]);

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
        // 直接滾動訊息容器到底部
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop =
                messageContainerRef.current.scrollHeight;
        }
    }, [messages]);

    if (loading) return <p>Loading messages...</p>;
    if (error) return <p>{error}</p>;
    if (!currentUser) return null;

    return (
        <div className={styles.messageWrapper} ref={messageContainerRef}>
            {" "}
            {messages.map((msg) => {
                console.log("msg.imageUrl:", msg.imageUrl);
                return msg.userId === currentUser.id ? (
                    <div key={msg.id} className={styles.myMessage}>
                        {msg.imageUrl && (
                            <div className={styles.imgWrapper}>
                                {" "}
                                <img
                                    src={
                                        import.meta.env.VITE_API_BASE_URL +
                                        msg.imageUrl
                                    }
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
                        {/* <div className={styles.avatarSection}>
                            {" "}
                            <img
                                src={getImageSrc(msg.user.image)}
                                alt={msg.user.name}
                                className={styles.avatar}
                            />
                            <p>{msg.user.name}</p>
                        </div> */}
                    </div>
                ) : (
                    <div key={msg.id} className={styles.otherMessage}>
                        <div className={styles.avatarSection}>
                            <img
                                src={getImageSrc(msg.user.image)}
                                alt={msg.user.name}
                                className={styles.avatar}
                            />
                            <p>{msg.user.name}</p>
                        </div>

                        {msg.imageUrl && (
                            <div className={styles.imgWrapper}>
                                {" "}
                                <img
                                    src={msg.imageUrl.replace(
                                        "/messages/",
                                        "/"
                                    )}
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
                );
            })}
        </div>
    );
};

export default Messages;
