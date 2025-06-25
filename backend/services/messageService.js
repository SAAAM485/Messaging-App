const { createMessage, listByConversation } = require("../db/queries/message");
const {
    sendMessageSchema,
    getMessagesSchema,
} = require("../validations/messageValidation");
const MessageError = class extends Error {
    constructor(message) {
        super(message);
        this.name = "MessageError";
    }
};

const messageService = {
    sendMessage: async ({ conversationId, userId, content, imageUrl }) => {
        const validated = sendMessageSchema.parse({
            conversationId,
            userId,
            content,
            imageUrl,
        });
        // 可加入內容長度驗證、圖片格式驗證
        return createMessage({
            conversationId: validated.conversationId,
            userId: validated.userId,
            content: validated.content,
            imageUrl: validated.imageUrl,
        });
    },

    getMessages: async ({ conversationId, take, skip }) => {
        const validated = getMessagesSchema.parse({
            conversationId,
            take,
            skip,
        });
        return listByConversation({
            conversationId: validated.conversationId,
            take: validated.take,
            skip: validated.skip,
        });
    },
};

module.exports = { messageService, MessageError };
