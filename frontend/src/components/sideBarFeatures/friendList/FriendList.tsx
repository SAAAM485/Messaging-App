import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./FriendList.module.css";
import { getAllAcceptedFriendship } from "../../../services/friendService";
import type { UserPreview } from "../../../types/models";

const FriendList = () => {
    const [friendList, setFriendList] = useState<UserPreview[]>();

    useEffect(() => {
        getAllAcceptedFriendship()
            .then((res) => {
                if (res.success && res.data) {
                    setFriendList(res.data);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch last seen.", err);
            });
    }, []);

    return (
        <div className={styles.friendListWrapper}>
            <h4 className={styles.title}>Friend List -</h4>
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
        </div>
    );
};

export default FriendList;
