import { useState } from "react";
import styles from "./Modal.module.css";
import type { UserPreview } from "../../types/models";
import { useAuthStore } from "../../store/useAuthStore";

type Props = {
    friends: UserPreview[];
    onConfirm: (payload: { name: string; participantIds: string[] }) => void;
    onCancel: () => void;
};

const MultiUserPickerModal = ({ friends, onConfirm, onCancel }: Props) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [groupName, setGroupName] = useState("");
    const currentUser = useAuthStore((state) => state.user);
    if (!currentUser) {
        onCancel();
        console.error("Current user not found.");
        return null;
    }

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleConfirm = () => {
        if (!groupName.trim()) return alert("Group name is required.");
        if (selectedIds.length <= 1)
            return alert("Select at least two friend.");
        onConfirm({
            name: groupName.trim(),
            participantIds: [...selectedIds, currentUser.id],
        });
    };

    return (
        <div className={styles.backdrop}>
            <div className={styles.modal}>
                <h3>Create Group Chat</h3>
                <input
                    className={styles.input}
                    placeholder="Group Name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                />
                <ul className={styles.friendList}>
                    {friends.map((friend) => (
                        <li
                            key={friend.id}
                            className={`${styles.friendItem} ${
                                selectedIds.includes(friend.id)
                                    ? styles.selected
                                    : ""
                            }`}
                            onClick={() => toggleSelect(friend.id)}
                        >
                            <img
                                src={friend.image || "/default-avatar.png"}
                                alt={friend.name}
                                className={styles.avatar}
                            />
                            <span>{friend.name}</span>
                        </li>
                    ))}
                </ul>
                <div className={styles.actions}>
                    <button
                        onClick={handleConfirm}
                        disabled={!groupName || selectedIds.length === 0}
                    >
                        Confirm
                    </button>
                    <button onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default MultiUserPickerModal;
