const {
    getFriendship,
    getRequestById,
    createFriendRequest,
    acceptFriendRequest,
    deleteFriendRequest,
    listIncomingRequests,
    listOutgoingRequests,
    listAllAcceptedFriends,
    listLastSeenFriends,
} = require("../db/queries/friend");

// 驗證 schema 引入，使用 CommonJS
const {
    sendRequestSchema,
    requestIdSchema,
    idSchema,
} = require("../validations/friendValidation");

class FriendshipError extends Error {
    constructor(message) {
        super(message);
        this.name = "FriendshipError";
    }
}

const friendService = {
    /** 檢查關係 */
    checkFriendship: async (userId, friendId) => {
        const { userId: uId, friendId: fId } = sendRequestSchema.parse({
            userId,
            friendId,
        });
        return getFriendship(uId, fId);
    },

    /** 取得所有已接受好友 */
    getAllAcceptedFriends: async (userId) => {
        const validatedUserId = idSchema.parse(userId);
        return listAllAcceptedFriends(validatedUserId);
    },

    /** 發送好友邀請 */
    sendFriendRequest: async (userId, friendId) => {
        const { userId: uId, friendId: fId } = sendRequestSchema.parse({
            userId,
            friendId,
        });
        if (uId === fId) {
            throw new FriendshipError("Cannot send request to yourself.");
        }
        const existing = await friendService.checkFriendship(uId, fId);
        if (existing) {
            if (existing.status === "pending") {
                throw new FriendshipError("Friend request already pending.");
            }
            if (existing.status === "accepted") {
                throw new FriendshipError("You are already friends.");
            }
        }
        return createFriendRequest({ userId: uId, friendId: fId });
    },

    /** 確認並接受好友邀請 */
    confirmFriendRequest: async (requestId, userId) => {
        const { requestId: reqId, userId: uId } = requestIdSchema.parse({
            requestId,
            userId,
        });
        const req = await getRequestById(reqId);
        if (!req || req.friendId !== uId) {
            throw new FriendshipError(
                "Invalid or unauthorized friend request."
            );
        }
        if (req.status !== "pending") {
            throw new FriendshipError("Friend request is not pending.");
        }
        return acceptFriendRequest(reqId);
    },

    /** 取消或拒絕邀請 */
    cancelFriendRequest: async (requestId, userId) => {
        const { requestId: reqId, userId: uId } = requestIdSchema.parse({
            requestId,
            userId,
        });
        const req = await getRequestById(reqId);
        if (![req.userId, req.friendId].includes(uId)) {
            throw new FriendshipError("Not authorized to cancel this request.");
        }
        return deleteFriendRequest(reqId);
    },

    /** 列出收到的邀請 */
    getIncomingRequests: async (userId) => {
        const validatedUserId = idSchema.parse(userId);
        return listIncomingRequests(validatedUserId);
    },

    /** 列出我發出的邀請 */
    getOutgoingRequests: async (userId) => {
        const validatedUserId = idSchema.parse(userId);
        return listOutgoingRequests(validatedUserId);
    },

    /** 列出 6 位最近上線的好友 */
    findLastSeenFriends: async (userId) => {
        const validatedUserId = idSchema.parse(userId);
        const friends = await listLastSeenFriends(validatedUserId);

        return friends
            .sort((a, b) => {
                const aTime = a.friend.lastSeen
                    ? new Date(a.friend.lastSeen).getTime()
                    : 0;
                const bTime = b.friend.lastSeen
                    ? new Date(b.friend.lastSeen).getTime()
                    : 0;
                return bTime - aTime;
            })
            .slice(0, 6);
    },
};

module.exports = { friendService, FriendshipError };
