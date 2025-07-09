const toUserPreview = (user) => ({
    id: user.id,
    name: user.name,
    image: user.image,
    motto: user.motto,
    lastSeen: user.lastSeen,
});

const toUserDTO = (user) => ({
    id: user.id,
    name: user.name,
    image: user.image,
    motto: user.motto,
    bio: user.bio,
    lastSeen: user.lastSeen,
    conversations: (user.conversations || []).map(toConversationParticipantDTO), // ✅ 修正
});

const toConversationDTO = (conversation) => ({
    id: conversation.id,
    name: conversation.name,
    isGroup: conversation.isGroup,
    messages: (conversation.messages || []).map(toMessageDTO), // ✅ 修正
    participants: (conversation.participants || []).map(
        toConversationParticipantDTO
    ),
});

const toMessageDTO = (message) => ({
    id: message.id,
    content: message.content,
    imageUrl: message.imageUrl,
    sentAt: message.sentAt,
    conversationId: message.conversationId,
    user: message.user ? toUserPreview(message.user) : undefined, // ✅ 用 Preview 避免遞迴
    userId: message.userId,
});

const toFriendDTO = (friend) => ({
    id: friend.id,
    status: friend.status,
    userId: friend.userId,
    friend: friend.friend ? toUserPreview(friend.friend) : undefined, // ✅ 保險 null check
    friendId: friend.friendId,
});

const toConversationParticipantDTO = (participant) => ({
    id: participant.id,
    conversationId: participant.conversationId,
    user: participant.user ? toUserPreview(participant.user) : undefined,
    userId: participant.userId,
    lastReadAt: participant.lastReadAt,
});

module.exports = {
    toUserPreview,
    toUserDTO,
    toConversationDTO,
    toMessageDTO,
    toFriendDTO,
    toConversationParticipantDTO,
};
