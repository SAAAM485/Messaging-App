import styles from "./GroupSwitch.module.css";

type Props = {
    isGroup: boolean;
    setIsGroup: (value: boolean) => void;
};

const GroupSwitch = ({ isGroup, setIsGroup }: Props) => (
    <div className={styles.groupSwitch}>
        <button
            onClick={() => setIsGroup(false)}
            className={isGroup ? "" : `${styles.active}`}
        >
            Chat Room
        </button>
        <button
            onClick={() => setIsGroup(true)}
            className={isGroup ? `${styles.active}` : ""}
        >
            Group Chat
        </button>
    </div>
);

export default GroupSwitch;
