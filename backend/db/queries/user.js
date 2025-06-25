const prisma = require("../client");

module.exports = {
    // 依 id 撈 user
    getUserById: (id) => prisma.user.findUnique({ where: { id } }),

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

    // 列出使用者所有會話（附帶最後一筆訊息、member list）
    listConversations: (userId) =>
        prisma.conversationParticipant.findMany({
            where: { userId },
            include: {
                conversation: {
                    include: {
                        participants: { include: { user: true } },
                        messages: { orderBy: { sentAt: "desc" }, take: 1 },
                    },
                },
            },
        }),

    findOrCreateAuthUser: async (provider, providerId, email, name, image) =>
        prisma.user.upsert({
            where: { provider_providerId: { provider, providerId } },
            update: { email, name, image },
            create: { provider, providerId, email, name, image },
        }),
};
