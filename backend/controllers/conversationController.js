const {
    conversationService,
    ConversationError,
} = require("../services/conversationService");

const handleError = (err, res) => {
    if (err instanceof ConversationError) {
        return res.status(err.message.includes("not found") ? 404 : 400).json({
            success: false,
            error: {
                code: "CONVERSATION_ERROR",
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
        if (req.params[key] !== undefined) acc[key] = req.params[key];
        if (req.body[key] !== undefined) acc[key] = req.body[key];
        return acc;
    }, {});

const conversationController = {
    /** 建立對話 */
    postConversation: async (req, res) => {
        try {
            const conv = await conversationService.createConversation(req.body);
            return res.status(201).json({ success: true, data: conv });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 取得對話 */
    getConversation: async (req, res) => {
        const { conversationId } = extractParams(req, ["conversationId"]);
        try {
            const conv = await conversationService.getConversationById(
                conversationId
            );
            return res.status(200).json({ success: true, data: conv });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 加入使用者到對話 */
    addUserToConversation: async (req, res) => {
        const { conversationId, userId } = extractParams(req, [
            "conversationId",
            "userId",
        ]);
        try {
            const updatedConv = await conversationService.addUserToConversation(
                conversationId,
                userId
            );
            return res.status(200).json({ success: true, data: updatedConv });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 移除使用者從對話 */
    removeUserFromConversation: async (req, res) => {
        const { conversationId } = extractParams(req, ["conversationId"]);
        try {
            const updatedConv = await conversationService.leaveConversation(
                conversationId
            );
            return res.status(200).json({ success: true, data: updatedConv });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 列出對話參與者 */
    listParticipants: async (req, res) => {
        const { conversationId } = extractParams(req, ["conversationId"]);
        try {
            const participants =
                await conversationService.getConversationParticipants(
                    conversationId
                );
            return res.status(200).json({ success: true, data: participants });
        } catch (err) {
            return handleError(err, res);
        }
    },
};
