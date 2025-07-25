import styles from "./ChatInput.module.css";
import { useState, useRef } from "react";
import {
    // addUserToConversation,
    removeUserFromConversation,
} from "../../../services/conversationService";
import { sendMessage } from "../../../services/messageService";
import type { Conversation } from "../../../types/models";

type Props = {
    conversation: Conversation;
    onSend: () => void;
};

const ChatInput = ({ conversation, onSend }: Props) => {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        // This function should open a modal or similar UI to select users
    };

    const handleRemoveUser = async () => {
        setLoading(true);
        const response = await removeUserFromConversation(conversationId);
        if (response.success) {
            setError(null);
        } else {
            setError(response.error?.message || "Failed to remove user");
        }
        setLoading(false);
    };

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleClickUpload = () => {
        fileInputRef.current?.click();
    };

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
            <button className={styles.alt} onClick={toggleAltList}>
                +
            </button>
            {open && (
                <div className={styles.altList}>
                    {conversation.isGroup && (
                        <button onClick={handleAddUser}>
                            Add User to Chat Room
                        </button>
                    )}
                    <button onClick={handleRemoveUser}>Quit Chat Room</button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={handleUpload}
                    />
                    <button onClick={handleClickUpload}>Upload an Image</button>
                </div>
            )}
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
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
};

export default ChatInput;
