const prisma = require("../client");

module.exports = {
    // 傳送一則訊息（文字 or 圖片）
    createMessage: ({ conversationId, userId, content, imageUrl = null }) =>
        prisma.message.create({
            data: { conversationId, userId, content, imageUrl },
            include: { user: true },
        }),

    // 撈指定 conversation 的歷史訊息（分頁 or limit）
    listByConversation: ({ conversationId, take = 50, skip = 0 }) =>
        prisma.message.findMany({
            where: { conversationId },
            orderBy: { sentAt: "asc" },
            take,
            skip,
            include: { user: true },
        }),
};
