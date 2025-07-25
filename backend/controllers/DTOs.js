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
    unreadCount: conversation.unreadCount ?? 0,
    lastReadAt: conversation.lastReadAt ?? null,
    messages: (conversation.messages || []).map(toMessageDTO),
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
    user: friend.user ? toUserPreview(friend.user) : undefined,
    userId: friend.userId,
    friend: friend.friend ? toUserPreview(friend.friend) : undefined,
    friendId: friend.friendId,
});

const toConversationParticipantDTO = (participant) => ({
    id: participant.id,
    conversationId: participant.conversationId,
    user: participant.user ? toUserPreview(participant.user) : undefined,
    userId: participant.userId,
    lastReadAt: participant.lastReadAt,
});

const toUserPreviewFromRelation = (rel, currentUserId) => {
    const target = rel.userId === currentUserId ? rel.friend : rel.user;
    return {
        id: target.id,
        name: target.name,
        image: target.image,
        lastSeen: target.lastSeen,
    };
};

module.exports = {
    toUserPreview,
    toUserDTO,
    toConversationDTO,
    toMessageDTO,
    toFriendDTO,
    toConversationParticipantDTO,
    toUserPreviewFromRelation,
};
