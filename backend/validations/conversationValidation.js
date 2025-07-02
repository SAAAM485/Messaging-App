const { z } = require("zod");

const createConvSchema = z.object({
    isGroup: z.boolean().default(false),
    name: z.string().optional(),
    participants: z
        .array(z.string().cuid(), "Invalid user ID format")
        .min(1, "At least one participant is required"),
});
const convPartIdSchema = z.string().cuid();
const convIdSchema = z.string().cuid();
const userIdSchema = z.string().cuid();
module.exports = {
    createConvSchema,
    convPartIdSchema,
    convIdSchema,
    userIdSchema,
};
