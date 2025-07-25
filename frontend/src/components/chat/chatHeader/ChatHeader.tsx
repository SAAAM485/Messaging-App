import styles from "./ChatHeader.module.css";
import type {
    Conversation,
    ConversationParticipant,
} from "../../../types/models";
import { useRequireUser } from "../../../store/userRequireUser";

type Props = {
    conversation: Conversation;
};

const ChatHeader = ({ conversation }: Props) => {
    const user = useRequireUser();
    const getOtherParticipants = (
        participants: ConversationParticipant[],
        currentUserId: string
    ) =>
        participants
            .filter((p) => p.user.id !== currentUserId)
            .map((p) => p.user);

    const otherParticipants = getOtherParticipants(
        conversation.participants,
        user.id
    );
    const name = conversation.isGroup
        ? conversation.name || otherParticipants.map((u) => u.name).join(", ")
        : otherParticipants[0].name || "Unknown";

    return (
        <div className={styles.header}>
            <h2>{name}</h2>
        </div>
    );
};

export default ChatHeader;
