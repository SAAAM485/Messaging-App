import styles from "./ChatInput.module.css";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import {
    addUserToConversation,
    removeUserFromConversation,
} from "../../../services/conversationService";
import { sendMessage } from "../../../services/messageService";
import type { Conversation } from "../../../types/models";
import ChatInputAltList from "./ChatInputAltList"; // Import the new component
import UserPickerModal from "../../modal/UserPickerModal"; // Re-add UserPickerModal

type Props = {
    conversation: Conversation;
    onSend: () => void;
};

const ChatInput = ({ conversation, onSend }: Props) => {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false); // This state will control the ChatInputAltList visibility
    const [error, setError] = useState<string | null>(null);
    const [showUserPicker, setShowUserPicker] = useState(false); // Revert to showUserPicker

    const conversationId = conversation.id;

    const handleSendMessage = async () => {
        if (!content.trim()) return;

        setLoading(true);
        const response = await sendMessage(conversationId, content);
        if (response.success) {
            setContent("");
            onSend();
            setError(null);
        } else {
            setError(response.error?.message || "Failed to send message");
        }
        setLoading(false);
    };

    const toggleAltList = () => {
        setOpen((prev) => !prev);
    };

    const handleAddUser = async () => {
        setShowUserPicker(true); // Open UserPickerModal
    };

    const handleUserSelected = async (userId: string) => {
        setLoading(true);
        const response = await addUserToConversation(conversationId, userId);
        if (!response.success) {
            setError(response.error?.message || "Failed to add user");
        } else {
            onSend(); // Re-fetch latest conversation data
            setError(null);
        }
        setLoading(false);
    };

    const handleRemoveUser = async () => {
        setLoading(true);
        if (!currentUser) {
            navigate("/login");
            return;
        }
        const response = await removeUserFromConversation(conversationId);
        console.log("Response from removeUserFromConversation:", response);
        if (response.success) {
            setError(null);
            navigate(`/profile/${currentUser.id}`);
        } else {
            setError(response.error?.message || "Failed to remove user");
        }
        setLoading(false);
    };

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const content = e.target.files?.[0];
        if (!content) return;

        setLoading(true);
        const response = await sendMessage(conversationId, content);

        if (response.success) {
            setError(null);
            onSend();
        } else {
            setError(response.error?.message || "Failed to send image");
        }
        setLoading(false);
    };

    return (
        <div className={styles.chatInput}>
            <div className={styles.inputContainer}> {/* New container */}
                <button className={styles.alt} onClick={toggleAltList}>
                    +
                </button>
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendMessage();
                    }}
                    placeholder="Type a message..."
                    disabled={loading}
                    className={styles.msg}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={loading}
                    className={styles.send}
                >
                    Send
                </button>
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <ChatInputAltList
                isOpen={open}
                onClose={() => setOpen(false)}
                conversation={conversation}
                onAddUser={handleAddUser}
                onRemoveUser={handleRemoveUser}
                onUploadImage={handleUpload}
                fileInputRef={fileInputRef}
                showUserPicker={showUserPicker}
                onUserSelected={handleUserSelected}
                onCloseUserPicker={() => setShowUserPicker(false)}
            />
            {showUserPicker && (
                <UserPickerModal
                    onSelect={handleUserSelected}
                    onClose={() => setShowUserPicker(false)}
                />
            )}
        </div>
    );
};

export default ChatInput;

