const { verify } = require("jsonwebtoken");
const prisma = require("../client");

module.exports = {
    // 依 id 撈 user
    getUserById: (id) => prisma.user.findUnique({ where: { id } }),

    // 依 username 開頭撈 users
    getUserByName: (username) =>
        prisma.user.findMany({
            where: {
                name: {
                    startsWith: username,
                    mode: "insensitive",
                },
            },
            select: {
                id: true,
                name: true,
                image: true,
            },
            take: 10,
        }),
    // 依 email 撈 user（登入時用）
    getUserByEmail: (email) => prisma.user.findUnique({ where: { email } }),

    // 建 new user
    createUser: (data) => prisma.user.create({ data }),

    // 更新個人資料（name, image, bio…）
    updateProfile: ({ id, data }) =>
        prisma.user.update({ where: { id }, data }),

    // 更新最後上線時間
    updateLastSeen: (id, time = new Date()) =>
        prisma.user.update({ where: { id }, data: { lastSeen: time } }),

    // 列出使用者所有群組會話
    listGroupConversations: async (userId) => {
        const parts = await prisma.conversationParticipant.findMany({
            where: { userId, conversation: { isGroup: true } },
            include: {
                conversation: {
                    include: {
                        participants: { include: { user: true } },
                        messages: { orderBy: { sentAt: "desc" }, take: 1 },
                    },
                },
            },
        });
        const results = await Promise.all(
            parts.map(async (p) => {
                const unreadCount = await prisma.message.count({
                    where: {
                        conversationId: p.conversationId,
                        sentAt: { gt: p.lastReadAt || new Date(0) },
                    },
                });
                return {
                    ...p.conversation,
                    unreadCount,
                    lastReadAt: p.lastReadAt,
                };
            })
        );

        return results;
    },

    // 列出使用者所有單人會話（附帶最後一筆訊息、member list）
    listConversations: async (userId) => {
        const parts = await prisma.conversationParticipant.findMany({
            where: { userId, conversation: { isGroup: false } },
            include: {
                conversation: {
                    include: {
                        participants: { include: { user: true } },
                        messages: { orderBy: { sentAt: "desc" }, take: 1 },
                    },
                },
            },
        });
        const results = await Promise.all(
            parts.map(async (p) => {
                const unreadCount = await prisma.message.count({
                    where: {
                        conversationId: p.conversationId,
                        sentAt: { gt: p.lastReadAt || new Date(0) },
                    },
                });
                return {
                    ...p.conversation,
                    unreadCount,
                    lastReadAt: p.lastReadAt,
                };
            })
        );

        return results;
    },

    findOrCreateAuthUser: async (provider, providerId, email, name, image) =>
        prisma.user.upsert({
            where: { provider_providerId: { provider, providerId } },
            update: { email, name, image },
            create: { provider, providerId, email, name, image },
        }),
};
