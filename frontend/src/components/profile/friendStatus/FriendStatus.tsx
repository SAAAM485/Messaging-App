import {
    getFriendship,
    confirmFriendRequest,
    deleteFriendRequest,
    sendFriendRequest,
} from "../../../services/friendService";
import { findOrCreateConversation } from "../../../services/conversationService";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Friend } from "../../../types/models";
import styles from "./FriendStatus.module.css";

type Props = {
    userId: string;
};

const FriendStatus = ({ userId }: Props) => {
    const [friendStatus, setFriendStatus] = useState<Friend | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchFriendStatus = async (userId: string) => {
        setLoading(true);
        const res = await getFriendship(userId);
        if (res.success) {
            setFriendStatus(res.data ?? null);
            setError(null);
        } else {
            setError(res.error?.message || "Failed to get friend status");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFriendStatus(userId);
    }, [userId]);

    const handleChat = async () => {
        const res = await findOrCreateConversation({ participantId: userId });
        if (res.success && res.data) {
            navigate(`/chat/${res.data.id}`);
        } else {
            setError(res.error?.message || "Failed to get find or create chat");
        }
    };

    const handleSendRequest = async () => {
        await sendFriendRequest(userId);
        fetchFriendStatus(userId); // 重新抓取狀態
    };

    const handleConfirm = async () => {
        if (!friendStatus) return;
        await confirmFriendRequest(friendStatus.id);
        fetchFriendStatus(userId);
    };

    const handleDelete = async () => {
        if (!friendStatus) return;
        await deleteFriendRequest(friendStatus.id);
        fetchFriendStatus(userId);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className={styles.statusWrapper}>
            <div className={styles.statusCard}>
                {!friendStatus && (
                    <div className={styles.cardWrapper}>
                        <p>You Are Not Friends Yet</p>
                        <button onClick={handleSendRequest}>Add Friend</button>
                    </div>
                )}
                {friendStatus?.status === "pending" &&
                    friendStatus.userId === userId && (
                        <div className={styles.cardWrapper}>
                            <p>Friend Request Received</p>
                            <div className={styles.buttonWrapper}>
                                <button
                                    className={styles.green}
                                    onClick={handleConfirm}
                                >
                                    Accept
                                </button>
                                <button
                                    className={styles.red}
                                    onClick={handleDelete}
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    )}
                {friendStatus?.status === "pending" &&
                    friendStatus.friendId === userId && (
                        <div className={styles.cardWrapper}>
                            <p>Friend Request sent</p>
                            <button
                                className={styles.red}
                                onClick={handleDelete}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                {friendStatus?.status === "accepted" && (
                    <div className={styles.cardWrapper}>
                        <p>You Are Friends</p>
                        <button className={styles.green} onClick={handleChat}>
                            Chat
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FriendStatus;
