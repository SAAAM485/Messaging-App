const {
    conversationService,
    ConversationError,
} = require("../services/conversationService");
const { toConversationDTO, toConversationParticipantDTO } = require("./DTOs");

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
        if (req.params[key] !== undefined) {
            acc[key] = req.params[key];
        } else if (req.body && req.body[key] !== undefined) {
            acc[key] = req.body[key];
        }
        return acc;
    }, {});

const conversationController = {
    /** 搜尋或建立私人對話 */
    findOrCreateConversation: async (req, res) => {
        const userId = req.user.userId;
        const { participantId } = extractParams(req, ["participantId"]);
        try {
            const conv = await conversationService.findOrCreateConversation(
                userId,
                participantId
            );

            return res
                .status(200)
                .json({ success: true, data: toConversationDTO(conv) });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 建立群組對話 */
    postGroupConversation: async (req, res) => {
        try {
            const conv = await conversationService.createConversation(req.body);
            return res
                .status(201)
                .json({ success: true, data: toConversationDTO(conv) });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 取得對話 */
    getConversation: async (req, res) => {
        const { conversationId } = extractParams(req, ["conversationId"]);
        const userId = req.user.userId;
        try {
            const conv = await conversationService.getConversationById(
                conversationId,
                userId
            );
            return res
                .status(200)
                .json({ success: true, data: toConversationDTO(conv) });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 加入使用者到對話 */
    addUserToConversation: async (req, res) => {
        const { conversationId, participantId } = extractParams(req, [
            "conversationId",
            "participantId",
        ]);
        try {
            const updatedConv = await conversationService.addUserToConversation(
                conversationId,
                participantId
            );
            const participants =
                await conversationService.getConversationParticipants(
                    conversationId
                );

            const convDto = toConversationDTO(updatedConv);

            convDto.participants = participants.map(
                toConversationParticipantDTO
            );

            return res.status(200).json({
                success: true,
                data: convDto,
            });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 移除使用者從對話 */
    removeUserFromConversation: async (req, res) => {
        const { conversationId } = extractParams(req, ["conversationId"]);
        const userId = req.user.userId;
        try {
            const result = await conversationService.leaveConversation(
                conversationId,
                userId
            );
            if (result.deleted) {
                return res.status(200).json({
                    success: true,
                    data: { message: "Conversation deleted." },
                });
            }
            const participants =
                await conversationService.getConversationParticipants(
                    conversationId
                );
            return res.status(200).json({
                success: true,
                data: participants.map(toConversationParticipantDTO),
            });
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
            return res.status(200).json({
                success: true,
                data: participants.map(toConversationParticipantDTO),
            });
        } catch (err) {
            return handleError(err, res);
        }
    },

    markAsRead: async (req, res) => {
        const { conversationId } = extractParams(req, ["conversationId"]);
        const userId = req.user.userId;
        try {
            const updatedLastRead = await conversationService.updateLastRead(
                conversationId,
                userId
            );
            return res.status(200).json({
                success: true,
                data: toConversationParticipantDTO(updatedLastRead),
            });
        } catch (err) {
            return handleError(err, res);
        }
    },
};

module.exports = conversationController;
