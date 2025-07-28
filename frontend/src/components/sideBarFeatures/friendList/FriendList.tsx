import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./FriendList.module.css";
import { getAllAcceptedFriendship } from "../../../services/friendService";
import { postGroupConversation } from "../../../services/conversationService";
import type { UserPreview } from "../../../types/models";
import MultiUserPickerModal from "../../modal/MultiUserPickerModal";

const FriendList = () => {
    const [friendList, setFriendList] = useState<UserPreview[]>();
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getAllAcceptedFriendship()
            .then((res) => {
                if (res.success && res.data) {
                    setFriendList(res.data);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch friend list.", err);
            });
    }, []);

    const handleModalOpen = () => {
        setShowModal(true);
    };

    const handleConfirmGroupChat = async ({
        name,
        participantIds,
    }: {
        name: string;
        participantIds: string[];
    }) => {
        const response = await postGroupConversation({
            name,
            isGroup: true,
            participantIds,
        });

        if (response.success && response.data) {
            navigate(`/chat/${response.data.id}`);
        } else {
            console.error("Failed to create group chat:", response.error);
        }

        setShowModal(false);
    };

    return (
        <div className={styles.friendListWrapper}>
            <div className={styles.head}>
                <h4 className={styles.title}>Friend List -</h4>
                <button onClick={handleModalOpen}>+ Group Chat</button>
            </div>
            <ul className={styles.friendList}>
                {friendList?.map((friend) => {
                    return (
                        <li key={friend.id} className={styles.friendItem}>
                            <Link
                                to={`/profile/${friend.id}`}
                                className={styles.link}
                            >
                                <img
                                    src={friend.image || "/default-avatar.png"}
                                    alt={friend.name}
                                    className={styles.avatar}
                                />
                                <div className={styles.info}>
                                    <span className={styles.name}>
                                        {friend.name}
                                    </span>
                                    <span className={styles.motto}>
                                        {friend.motto}
                                    </span>
                                </div>
                            </Link>
                        </li>
                    );
                })}
            </ul>
            {showModal && friendList && (
                <MultiUserPickerModal
                    friends={friendList}
                    onConfirm={handleConfirmGroupChat}
                    onCancel={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default FriendList;
