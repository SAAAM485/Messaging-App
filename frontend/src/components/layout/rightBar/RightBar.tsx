import LastSeen from "../../sideBarFeatures/lastSeen/LastSeen";
import FriendList from "../../sideBarFeatures/friendList/FriendList";
import styles from "./RightBar.module.css";

const RightBar = () => {
    return (
        <aside className={styles.rightBar}>
            <LastSeen />
            <FriendList />
        </aside>
    );
};

export default RightBar;
