import React from 'react';
import styles from './ChatInputAltList.module.css';
import UserPickerModal from '../../modal/UserPickerModal';
import type { Conversation } from '../../../types/models';

// This is a trivial change to force recompile and clear stale errors.

type Props = {
    isOpen: boolean;
    onClose: () => void;
    conversation: Conversation;
    onAddUser: () => void;
    onRemoveUser: () => void;
    onUploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    showUserPicker: boolean;
    onUserSelected: (userId: string) => void;
    onCloseUserPicker: () => void;
};

const ChatInputAltList: React.FC<Props> = ({
    isOpen,
    onClose,
    conversation,
    onAddUser,
    onRemoveUser,
    onUploadImage,
    fileInputRef,
    showUserPicker,
    onUserSelected,
    onCloseUserPicker,
}) => {
    if (!isOpen) return null;

    return (
        <div className={styles.altList}>
            {conversation.isGroup && (
                <button onClick={onAddUser}>Add User</button>
            )}
            <button onClick={onRemoveUser}>Quit Chat Room</button>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={onUploadImage}
            />
            <button onClick={() => fileInputRef.current?.click()}>Upload an Image</button>
            <button onClick={onClose}>Close</button>

            {showUserPicker && (
                <UserPickerModal
                    onSelect={onUserSelected}
                    onClose={onCloseUserPicker}
                />
            )}
        </div>
    );
};

export default ChatInputAltList;