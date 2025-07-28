import { useEffect, useState } from "react";
import { getAllAcceptedFriendship } from "../../services/friendService";
import type { UserPreview } from "../../types/models";

type Props = {
    onSelect: (userId: string) => void;
    onClose: () => void;
};

const UserPickerModal = ({ onSelect, onClose }: Props) => {
    const [friends, setFriends] = useState<UserPreview[]>([]);
    const [loading, setLoading] = useState(false);

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

    return (
        <div className="modal">
            <h3>Select a user to add:</h3>
            {loading ? (
                <p>Loading...</p>
            ) : (
                friends.map((user) => (
                    <button
                        key={user.id}
                        onClick={() => {
                            onSelect(user.id);
                            onClose();
                        }}
                    >
                        {user.name}
                    </button>
                ))
            )}
            <button onClick={onClose}>Cancel</button>
        </div>
    );
};

export default UserPickerModal;
