const { z } = require("zod");

const sendMessageSchema = z.object({
    conversationId: z.string().cuid("Invalid conversation ID format"),
    userId: z.string().cuid("Invalid user ID format"),
    content: z
        .string()
        .max(500, "Message content cannot exceed 500 characters")
        .optional(),
    imageUrl: z.string().optional().nullable(),
});

const getMessagesSchema = z.object({
    conversationId: z.string().cuid("Invalid conversation ID format"),
    take: z.number().int().min(1).max(100).default(50),
    skip: z.number().int().min(0).default(0),
});

module.exports = {
    sendMessageSchema,
    getMessagesSchema,
};
