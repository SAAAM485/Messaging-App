const { z } = require("zod");

const sendRequestSchema = z.object({
    userId: z.string().cuid(),
    friendId: z.string().cuid(),
});
const requestIdSchema = z.object({
    requestId: z.string().cuid(),
    userId: z.string().cuid(),
});
const idSchema = z.object({
    userId: z.string().cuid(),
    status: z.enum(["pending", "accepted"]).optional(),
});

module.exports = {
    sendRequestSchema,
    requestIdSchema,
    idSchema,
};
