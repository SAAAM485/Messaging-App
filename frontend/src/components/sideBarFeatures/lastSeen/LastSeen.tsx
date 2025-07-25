import { useEffect, useState } from "react";
import styles from "./LastSeen.module.css";
import { getLastSeenFriends } from "../../../services/friendService";
import type { UserPreview } from "../../../types/models";
import { formatDistanceToNow } from "date-fns";

const LastSeen = () => {
    const [tick, setTick] = useState(0);
    const [lastSeen, setLastSeen] = useState<UserPreview[]>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getLastSeenFriends();
                if (res.success && res.data) {
                    setLastSeen(res.data);
                    console.log("API 回傳 lastSeen 資料：", res.data);
                }
            } catch (err) {
                console.error("Failed to fetch last seen.", err);
            }
        };

        fetchData(); // 初始載入
        const fetchInterval = setInterval(fetchData, 600000); // 每 60 秒更新一次資料
        const reRenderInterval = setInterval(
            () => setTick((t) => t + 1),
            300000
        ); // 每 30 秒強制 re-render

        return () => {
            clearInterval(fetchInterval);
            clearInterval(reRenderInterval);
        };
    }, []);

    return (
        <div className={styles.lastSeenWrapper}>
            <h4 className={styles.title}>Last Seen -</h4>
            <ul className={styles.friendList}>
                {lastSeen?.map((friend) => {
                    const lastSeenTime = friend.lastSeen
                        ? new Date(friend.lastSeen).getTime()
                        : null;
                    const isOnline =
                        lastSeenTime !== null &&
                        Date.now() - lastSeenTime < 60 * 1000;
                    const status = !lastSeenTime
                        ? "Unknown"
                        : isOnline
                        ? "Online"
                        : formatDistanceToNow(lastSeenTime, {
                              addSuffix: true,
                          });

                    return (
                        <li key={friend.id} className={styles.friendItem}>
                            <img
                                src={friend.image || "/default-avatar.png"}
                                alt={friend.name}
                                className={styles.avatar}
                            />
                            <div className={styles.info}>
                                <span className={styles.name}>
                                    {friend.name}
                                </span>
                                <span className={styles.status}>{status}</span>
                            </div>
                            <span
                                className={
                                    isOnline
                                        ? styles.onlineDot
                                        : styles.offlineDot
                                }
                            ></span>
                        </li>
                    );
                })}
            </ul>
            <span style={{ display: "none" }}>{tick}</span>
        </div>
    );
};

export default LastSeen;
