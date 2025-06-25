const prisma = require("../client");

module.exports = {
    // 查雙向關係（避免重複／自邀請）
    getFriendship: (userId, friendId) =>
        prisma.friend.findFirst({
            where: {
                OR: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId },
                ],
            },
        }),

    getRequestById: (id) =>
        prisma.friend.findUnique({
            where: { id },
            include: {
                user: true, // 發出邀請的使用者資訊
                friend: true, // 被邀請的使用者資訊
            },
        }),

    // 查所有accepted好友
    listAllAcceptedFriends: (userId) =>
        prisma.friend.findMany({
            where: {
                OR: [
                    { userId, status: "accepted" },
                    { friendId: userId, status: "accepted" },
                ],
            },
            include: {
                user: true,
                friend: true,
            },
        }),

    // 建立好友邀請
    createFriendRequest: ({ userId, friendId }) =>
        prisma.friend.create({ data: { userId, friendId, status: "pending" } }),

    // 接受邀請
    acceptFriendRequest: (id) =>
        prisma.friend.update({ where: { id }, data: { status: "accepted" } }),

    // 拒絕或刪除邀請／關係
    deleteFriendRequest: (id) => prisma.friend.delete({ where: { id } }),

    // 取得某使用者的所有好友（只看 accepted）
    listFriends: (userId) =>
        prisma.friend.findMany({
            where: {
                OR: [
                    { userId, status: "accepted" },
                    { friendId: userId, status: "accepted" },
                ],
            },
            include: {
                user: true,
                friend: true,
            },
        }),

    // 收到的邀請（對方 userId→我 friendId）
    listIncomingRequests: (userId) =>
        prisma.friend.findMany({
            where: { friendId: userId, status: "pending" },
            include: { user: true }, // 把發出邀請的那位 user 資訊一起抓出來
        }),

    // 我發出的邀請（我 userId→對方 friendId）
    listOutgoingRequests: (userId) =>
        prisma.friend.findMany({
            where: { userId: userId, status: "pending" },
            include: { friend: true }, // 把被邀請的那位 user 資訊一起抓出來
        }),
};
