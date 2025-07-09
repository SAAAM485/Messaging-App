const { friendService, FriendshipError } = require("../services/friendService");
const { toFriendDTO } = require("./DTOs");

const handleError = (err, res) => {
    if (err instanceof FriendshipError) {
        return res.status(err.message.includes("not found") ? 404 : 400).json({
            success: false,
            error: {
                code: "FRIENDSHIP_ERROR",
                message: err.message,
            },
        });
    }
    console.error(err);
    return res.status(500).json({
        success: false,
        error: {
            code: "INTERNAL_ERROR",
            message: "Internal server error",
        },
    });
};

const extractParams = (req, keys) =>
    keys.reduce((acc, key) => {
        if (req.params[key] !== undefined) {
            acc[key] = req.params[key];
        } else if (req.body && req.body[key] !== undefined) {
            acc[key] = req.body[key];
        }
        return acc;
    }, {});

const friendController = {
    /** 檢查關係 */
    getFriendship: async (req, res) => {
        const { friendId } = extractParams(req, ["friendId"]);
        const userId = req.user.userId;
        try {
            const relationship = await friendService.checkFriendship(
                userId,
                friendId
            );
            // 若没找到，service 会 throw；找到之后我们包装一个 DTO
            return res
                .status(200)
                .json({ success: true, data: toFriendDTO(relationship) });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 取得所有已接受好友 */
    getAllAcceptedFriendship: async (req, res) => {
        const userId = req.user.userId;
        try {
            const friends = await friendService.getAllAcceptedFriends(userId);
            return res
                .status(200)
                .json({ success: true, data: friends.map(toFriendDTO) });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 發送好友邀請 */
    sendFriendRequest: async (req, res) => {
        const { friendId } = extractParams(req, ["friendId"]);
        const userId = req.user.userId;
        try {
            const request = await friendService.sendFriendRequest(
                userId,
                friendId
            );
            return res
                .status(201)
                .json({ success: true, data: toFriendDTO(request) });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 確認並接受好友邀請 */
    confirmFriendRequest: async (req, res) => {
        const { requestId } = extractParams(req, ["requestId"]);
        const userId = req.user.userId;
        try {
            const updatedRequest = await friendService.confirmFriendRequest(
                requestId,
                userId
            );
            return res
                .status(200)
                .json({ success: true, data: toFriendDTO(updatedRequest) });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 取消或拒絕邀請 */
    deleteFriendRequest: async (req, res) => {
        const { requestId } = extractParams(req, ["requestId"]);
        const userId = req.user.userId;
        try {
            await friendService.cancelFriendRequest(requestId, userId);
            return res.status(200).json({
                success: true,
                data: {
                    message: "Deleted successfully.",
                },
            });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 取得所有收到的邀請 */
    getAllReceivedRequests: async (req, res) => {
        const userId = req.user.userId;
        try {
            const requests = await friendService.getIncomingRequests(userId);
            return res
                .status(200)
                .json({ success: true, data: requests.map(toFriendDTO) });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 取得所有發出的邀請 */
    getAllSentRequests: async (req, res) => {
        const userId = req.user.userId;
        try {
            const requests = await friendService.getOutgoingRequests(userId);
            return res
                .status(200)
                .json({ success: true, data: requests.map(toFriendDTO) });
        } catch (err) {
            return handleError(err, res);
        }
    },
};

module.exports = friendController;
