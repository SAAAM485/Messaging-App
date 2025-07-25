import styles from "./ProfilePage.module.css";
import UserCard from "../../components/profile/userCard/UserCard";
import FriendStatus from "../../components/profile/friendStatus/FriendStatus";
import { useParams } from "react-router-dom";
import { useRequireUser } from "../../store/userRequireUser";

export default function ProfilePage() {
    const { userId } = useParams();
    const currentUser = useRequireUser();

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
