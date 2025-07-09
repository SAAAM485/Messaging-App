const { messageService, MessageError } = require("../services/messageService");
const { toMessageDTO } = require("./DTOs");

const handleError = (err, res) => {
    if (err instanceof MessageError) {
        return res.status(err.message.includes("not found") ? 404 : 400).json({
            success: false,
            error: {
                code: "MESSAGE_ERROR",
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

const messageController = {
    /** 發送訊息 */
    postMessage: async (req, res) => {
        const { conversationId, content, imageUrl } = extractParams(req, [
            "conversationId",
            "content",
            "imageUrl",
        ]);
        const userId = req.user.userId;
        try {
            const message = await messageService.sendMessage({
                conversationId,
                userId,
                content,
                imageUrl,
            });
            console.log("Message created:", message);
            console.log("Message sent:", toMessageDTO(message));
            return res.status(201).json({
                success: true,
                data: toMessageDTO(message),
            });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 取得對話訊息 */
    getMessages: async (req, res) => {
        const { conversationId, take, skip } = extractParams(req, [
            "conversationId",
            "take",
            "skip",
        ]);

        try {
            const messages = await messageService.getMessages({
                conversationId,
                take: take ? parseInt(take) : 50,
                skip: skip ? parseInt(skip) : 0,
            });
            return res.status(200).json({
                success: true,
                data: messages.map(toMessageDTO),
            });
        } catch (err) {
            return handleError(err, res);
        }
    },
};

module.exports = messageController;
