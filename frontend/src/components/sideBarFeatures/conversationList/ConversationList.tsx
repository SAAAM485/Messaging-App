import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./ConversationList.module.css";
import {
    getUserConversations,
    getUserGroupConversations,
} from "../../../services/userService";
import type {
    Conversation,
    ConversationParticipant,
} from "../../../types/models";
import { useAuthStore } from "../../../store/useAuthStore";
import CompositeAvatar from "../../common/CompositeAvatar/CompositeAvatar";

const getOtherParticipants = (
    participants: ConversationParticipant[],
    currentUserId: string
) => participants.filter((p) => p.user.id !== currentUserId).map((p) => p.user);

const getLastMessage = (conversation: Conversation) =>
    conversation.messages[0]
        ? conversation.messages[0].content ?? "[Image]"
        : "No messages yet";

const ConversationList = ({ isGroup }: { isGroup: boolean }) => {
    const [chatRooms, setChatRooms] = useState<Conversation[]>([]);
    const currentUser = useAuthStore((s) => s.user);
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            navigate("/login");
            return;
        }
        const fetchConversations = async () => {
            const response = isGroup
                ? await getUserGroupConversations()
                : await getUserConversations();

            if (response.success && response.data) {
                setChatRooms(response.data);
            } else {
                console.error(response.error?.message);
            }
        };

        fetchConversations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isGroup, currentUser]);

    if (!currentUser) return null;
    if (!chatRooms || chatRooms.length === 0) {
        return <div className={styles.empty}>No Conversations</div>;
    }

    return (
        <ul className={styles.listWrapper}>
            {chatRooms.map((chat) => {
                const otherUsers = getOtherParticipants(
                    chat.participants,
                    currentUser.id
                );

                const name = isGroup
                    ? chat.name || otherUsers.map((u) => u.name).join(", ")
                    : otherUsers[0]?.name || "Unknown";

                const image = isGroup ? (
                    <CompositeAvatar users={otherUsers.slice(0, 4)} />
                ) : (
                    <img
                        src={otherUsers[0]?.image || "/logo.png"}
                        alt={otherUsers[0]?.name}
                        className={styles.avatar}
                    />
                );

                return (
                    <li key={chat.id} className={styles.chatItem}>
                        <Link to={`/chat/${chat.id}`} className={styles.link}>
                            {image}
                            <div className={styles.chatInfo}>
                                <div className={styles.infoWrapper}>
                                    <div className={styles.chatName}>
                                        {name}
                                    </div>
                                    <div className={styles.lastMsg}>
                                        {getLastMessage(chat)}
                                    </div>
                                </div>
                                {chat.unreadCount > 0 ? (
                                    <span className={styles.badge}>
                                        {chat.unreadCount}
                                    </span>
                                ) : (
                                    <span className={styles.noBadge}></span>
                                )}
                            </div>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
};

export default ConversationList;
