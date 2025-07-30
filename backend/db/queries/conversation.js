const prisma = require("../client");

module.exports = {
    // 依 userId 尋找 private conversation
    findPrivateConversation: async (userId1, userId2) => {
        return prisma.conversation.findFirst({
            where: {
                isGroup: false,
                participants: {
                    every: {
                        userId: {
                            in: [userId1, userId2],
                        },
                    },
                },
            },
            include: {
                participants: {
                    include: {
                        user: true,
                    },
                },
                messages: {
                    orderBy: {
                        sentAt: "desc",
                    },
                    take: 1,
                },
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
    deleteConversationIfEmpty: async (conversationId) => {
        // 先刪除所有相關的 ConversationParticipant 記錄
        await prisma.conversationParticipant.deleteMany({
            where: { conversationId: conversationId },
        });
        // 然後刪除 Conversation
        return prisma.conversation.delete({
            where: { id: conversationId },
        });
    },

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
