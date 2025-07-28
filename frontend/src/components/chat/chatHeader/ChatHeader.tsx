import styles from "./ChatHeader.module.css";
import type {
    Conversation,
    ConversationParticipant,
} from "../../../types/models";
import { useAuthStore } from "../../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

type Props = {
    conversation: Conversation;
};

const ChatHeader = ({ conversation }: Props) => {
    const currentUser = useAuthStore((s) => s.user);
    const navigate = useNavigate();
    if (!currentUser) {
        navigate("/login");
        return;
    }
    const getOtherParticipants = (
        participants: ConversationParticipant[],
        currentUserId: string
    ) =>
        participants
            .filter((p) => p.user.id !== currentUserId)
            .map((p) => p.user);

    const otherParticipants = getOtherParticipants(
        conversation.participants,
        currentUser.id
    );
    const name = conversation.isGroup
        ? conversation.name || otherParticipants.map((u) => u.name).join(", ")
        : otherParticipants[0].name || "Unknown";
    if (!currentUser) return null;
    return (
        <div className={styles.header}>
            <h2>{name}</h2>
        </div>
    );
};

export default ChatHeader;
