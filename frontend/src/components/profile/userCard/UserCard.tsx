import { getUserById } from "../../../services/userService";
import { useEffect, useState, useRef } from "react";
import type { User } from "../../../types/models";
import styles from "./UserCard.module.css";
import { useRequireUser } from "../../../store/userRequireUser";
import { updateUserProfile } from "../../../services/userService";

type Props = {
    userId: string;
};

const UserCard = ({ userId }: Props) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [editName, setEditName] = useState("");
    const [editMotto, setEditMotto] = useState("");
    const [editBio, setEditBio] = useState("");
    const currentUser = useRequireUser();

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            const response = await getUserById(userId);
            if (response.success && response.data) {
                setUser(response.data);
                setError(null);
            } else {
                setError(response.error?.message || "Failed to load user");
            }
            setLoading(false);
        };

        fetchUser();
    }, [userId]);

    const handleEditClick = () => {
        if (!user) return;
        setEditName(user.name ?? "");
        setEditMotto(user.motto ?? "");
        setEditBio(user.bio ?? "");
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!user) return;

        setLoading(true);
        const response = await updateUserProfile({
            id: user.id,
            name: editName,
            motto: editMotto,
            bio: editBio,
        });
        setLoading(false);

        if (response.success && response.data) {
            setUser(response.data);
            setIsEditing(false);
            setError(null);
        } else {
            setError(response.error?.message || "Failed to update user");
        }
    };

    const handleImageChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await updateUserProfile(formData);
            if (response.success && response.data) {
                setUser(response.data);
                setError(null);
            } else {
                setError(response.error?.message || "Failed to upload image");
            }
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!user) return <p>User not found</p>;

    return (
        <div className={styles.userCardWrapper}>
            <div className={styles.topCard}>
                {currentUser.id === user.id && !isEditing && (
                    <button onClick={handleEditClick}>
                        <img src="/gear.png" alt="setting" />
                    </button>
                )}
                <img
                    src={user.image || "/default-avatar.png"}
                    alt={user.name}
                    style={{ width: 80, height: 80, borderRadius: "50%" }}
                />
                {isEditing ? (
                    <>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            {uploading
                                ? "Uploading..."
                                : "Upload Profile Image"}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                        />
                        <input
                            type="text"
                            value={editMotto}
                            onChange={(e) => setEditMotto(e.target.value)}
                        />
                    </>
                ) : (
                    <>
                        <h2>{user.name}</h2>
                        <p>{user.motto}</p>
                    </>
                )}
            </div>
            <div className={styles.bio}>
                {isEditing ? (
                    <textarea
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                    />
                ) : (
                    user.bio
                )}
            </div>

            {isEditing && (
                <div>
                    <button onClick={handleSave}>Save</button>
                    <button onClick={handleCancel}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default UserCard;
