const prisma = require("../client");

module.exports = {
    // 依 userId 尋找 private conversation
    findPrivateConversation: async (userId1, userId2) => {
        const convs = await prisma.conversation.findMany({
            where: {
                isGroup: false,
                participants: {
                    some: { userId: userId1 },
                    some: { userId: userId2 },
                },
            },
            include: {
                participants: true,
            },
        });

        const matched = convs.find((conv) => {
            const ids = conv.participants.map((p) => p.userId);
            return (
                ids.length === 2 &&
                ids.includes(userId1) &&
                ids.includes(userId2)
            );
        });

        if (!matched) return;

        return prisma.conversation.findUnique({
            where: { id: matched.id },
            include: {
                participants: { include: { user: true } },
                messages: { orderBy: { sentAt: "desc" }, take: 1 },
            },
        });
    },

    // 建新的 conversation
    createConversation: ({ isGroup = false, name = null }) =>
        prisma.conversation.create({
            data: { isGroup, name },
        }),

    // 依 id 撈 conversation
    getConversationById: (id) =>
        prisma.conversation.findUnique({
            where: { id },
            include: {
                participants: { include: { user: true } },
                messages: { orderBy: { sentAt: "desc" }, take: 1 }, // 只取最後一筆訊息
            },
        }),

    // 加 participant
    addParticipant: ({ conversationId, userId }) =>
        prisma.conversationParticipant.create({
            data: { conversationId, userId },
        }),

    // 刪除 participant（退出群組）
    removeParticipant: (conversationId, userId) =>
        prisma.conversationParticipant.delete({
            where: { conversationId_userId: { conversationId, userId } },
        }),

    // 計算 participant 數量
    countParticipants: (conversationId) =>
        prisma.conversationParticipant.count({
            where: { conversationId },
        }),

    // 刪除 participant 小於等於 1 的 Conversation
    deleteConversationIfEmpty: async (conversationId) =>
        prisma.conversation.delete({
            where: { id: conversationId },
        }),

    // 查 conversation 的所有 participant
    listParticipants: (conversationId) =>
        prisma.conversationParticipant.findMany({
            where: { conversationId },
            include: { user: true },
        }),

    // 更新 participant 的 lastReadAt
    updateLastReadAt: (conversationId, userId) =>
        prisma.conversationParticipant.update({
            where: {
                conversationId_userId: { conversationId, userId },
            },
            data: {
                lastReadAt: new Date(),
            },
        }),
};
