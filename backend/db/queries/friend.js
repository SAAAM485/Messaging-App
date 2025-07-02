const prisma = require("../client");

module.exports = {
    // 查雙向關係
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
            include: { user: true, friend: true },
        }),

    // 所有已接受的好友
    listAllAcceptedFriends: (userId) =>
        prisma.friend.findMany({
            where: {
                OR: [
                    { userId, status: "accepted" },
                    { friendId: userId, status: "accepted" },
                ],
            },
            include: { user: true, friend: true },
        }),

    createFriendRequest: ({ userId, friendId }) =>
        prisma.friend.create({
            data: { userId, friendId, status: "pending" },
        }),

    acceptFriendRequest: (id) =>
        prisma.friend.update({ where: { id }, data: { status: "accepted" } }),

    deleteFriendRequest: (id) => prisma.friend.delete({ where: { id } }),

    // 收到的邀請
    listIncomingRequests: (userId) =>
        prisma.friend.findMany({
            where: { friendId: userId, status: "pending" },
            include: { user: true },
        }),

    // 我發出的邀請
    listOutgoingRequests: (userId) =>
        prisma.friend.findMany({
            where: { userId, status: "pending" },
            include: { friend: true },
        }),
};
