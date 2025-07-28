import styles from "./ProfilePage.module.css";
import UserCard from "../../components/profile/userCard/UserCard";
import FriendStatus from "../../components/profile/friendStatus/FriendStatus";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useEffect } from "react";

export default function ProfilePage() {
    const { userId } = useParams();
    const currentUser = useAuthStore((s) => s.user);
    const navigate = useNavigate();
    console.log(
        "ProfilePage userId:",
        userId,
        "currentUser:",
        currentUser?.name,
        currentUser?.id
    );

    useEffect(() => {
        if (!currentUser) {
            navigate("/login");
            return;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    if (!currentUser) return null;

    const targetUserId = userId ?? currentUser.id;

    return (
        <div className={styles.profilePage}>
            <UserCard userId={targetUserId} />
            {currentUser.id !== targetUserId && (
                <FriendStatus userId={targetUserId} />
            )}
        </div>
    );
}
