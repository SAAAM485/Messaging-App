import { useEffect, useState } from "react";
import { getAllAcceptedFriendship } from "../../services/friendService";
import type { UserPreview } from "../../types/models";
import styles from "./Modal.module.css"; // Import Modal.module.css
import { getImageSrc } from "../../utils/imageUtils";

type Props = {
    onSelect: (userId: string) => void;
    onClose: () => void;
};

const UserPickerModal = ({ onSelect, onClose }: Props) => {
    const [friends, setFriends] = useState<UserPreview[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null); // New state for single selection

    useEffect(() => {
        const fetchFriends = async () => {
            setLoading(true);
            const response = await getAllAcceptedFriendship();
            if (response.success && response.data) {
                setFriends(response.data);
            }
            setLoading(false);
        };
        fetchFriends();
    }, []);

    const handleConfirm = () => {
        if (selectedUserId) {
            onSelect(selectedUserId);
            onClose();
        }
    };

    return (
        <div className={styles.backdrop}> {/* Add backdrop */}
            <div className={styles.modal}> {/* Add modal */}
                <h3>Select Friend</h3> {/* Changed title */}
                <div className={styles.modalContentArea}> {/* Wrap content in modalContentArea */}
                    {loading ? (
                        <ul className={styles.friendList}> {/* Skeleton loader */}
                            {[...Array(5)].map((_, index) => (
                                <li key={index} className={styles.friendItem}>
                                    <div className={`${styles.avatar} ${styles.skeleton}`}></div>
                                    <div className={`${styles.name} ${styles.skeleton}`}></div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <ul className={styles.friendList}> {/* Use friendList style */}
                            {friends.map((user) => (
                                <li
                                    key={user.id}
                                    className={`${styles.friendItem} ${
                                        selectedUserId === user.id ? styles.selected : ""
                                    }`} // Add selected style
                                    onClick={() => setSelectedUserId(user.id)} // Only set selected user, don't close yet
                                >
                                    <img
                                        src={getImageSrc(user.image)}
                                        alt={user.name}
                                        className={styles.avatar}
                                    />
                                    <span>{user.name}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className={styles.actions}> {/* Use actions style */}
                    <button onClick={handleConfirm} disabled={!selectedUserId}>Confirm</button> {/* Disable if no user selected */}
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default UserPickerModal;
