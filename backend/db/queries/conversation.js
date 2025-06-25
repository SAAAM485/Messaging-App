const prisma = require("../client");

module.exports = {
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
    removeParticipant: (conversationParticipantId) =>
        prisma.conversationParticipant.delete({
            where: { id: conversationParticipantId },
        }),

    // 查 conversation 的所有 participant
    listParticipants: (conversationId) =>
        prisma.conversationParticipant.findMany({
            where: { conversationId },
            include: { user: true },
        }),
};
