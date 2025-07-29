import { getUserById } from "../../../services/userService";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../../../types/models";
import styles from "./UserCard.module.css";
import { useAuthStore } from "../../../store/useAuthStore";
import { updateUserProfile } from "../../../services/userService";
import { FaCog } from "react-icons/fa"; // 導入齒輪圖示
import { getImageSrc } from "../../../utils/imageUtils";

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
    const currentUser = useAuthStore((s) => s.user);
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            navigate("/login");
            return;
        }

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, currentUser]);

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
    if (!currentUser) return null;
    if (!user) return <p>User not found</p>;

    return (
        <div className={styles.userCardWrapper}>
            <div className={styles.topCard}>
                {currentUser.id === user.id && !isEditing && (
                    <button
                        onClick={handleEditClick}
                        className={styles.settingsButton}
                    >
                        <FaCog className={styles.settingsIcon} />{" "}
                        {/* 使用 FaCog 圖示 */}
                    </button>
                )}
                <div className={styles.avatarContainer} onClick={() => isEditing && fileInputRef.current?.click()}>
                    <img
                        src={getImageSrc(user.image)}
                        alt={user.name}
                        className={styles.avatar}
                    />
                    {isEditing && (
                        <div className={styles.uploadOverlay}>
                            {uploading ? "Uploading..." : "Change Photo"}
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleImageChange}
                />
                {isEditing ? (
                    <>
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className={styles.editInput}
                        />
                        <input
                            type="text"
                            value={editMotto}
                            onChange={(e) => setEditMotto(e.target.value)}
                            className={styles.editInput}
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
                        className={styles.editInput}
                    />
                ) : (
                    user.bio
                )}
            </div>

            {isEditing && (
                <div className={styles.actions}>
                    <button onClick={handleSave} className={styles.actionButton}>Save</button>
                    <button onClick={handleCancel} className={styles.actionButton}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default UserCard;
