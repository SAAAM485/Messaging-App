import Notification from "../../sideBarFeatures/notification/Notification";
import GroupSwitch from "../../sideBarFeatures/groupSwitch/GroupSwitch";
import ConversationList from "../../sideBarFeatures/conversationList/ConversationList";
import { useState } from "react";
import styles from "./LeftBar.module.css";

const LeftBar = () => {
    const [isGroup, setIsGroup] = useState(false);

    return (
        <aside className={styles.leftBar}>
            <div className={styles.leftBarContent}> {/* 新增的 div */}
                <Notification />
                <GroupSwitch isGroup={isGroup} setIsGroup={setIsGroup} />
                <ConversationList isGroup={isGroup} />
            </div>
        </aside>
    );
};

export default LeftBar;