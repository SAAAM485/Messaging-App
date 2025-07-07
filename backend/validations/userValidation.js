const { z } = require("zod");

// 1. 建立使用者（註冊）schema：所有欄位必填或具預設
const createProfileSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .max(30, "Name max 30 characters"),
    email: z.string().email("Invalid email address"),
    image: z.string().url("Invalid image URL"),
    motto: z.string().max(100, "Motto max 100 characters").optional(),
    bio: z.string().max(160, "Bio max 160 characters").optional(),
});

// 2. 更新使用者資料schema：所有欄位 optional
const updateProfileSchema = createProfileSchema.partial();

// 3. 第三方 Auth schema
const authSchema = z.object({
    provider: z.string().min(1, "Provider is required"),
    providerId: z.string().min(1, "ProviderId is required"),
    email: z.string().email("Invalid email for auth"),
    name: z.string().min(1, "Name is required").optional(),
    image: z.string().url("Invalid image URL").optional(),
});

const userIdSchema = z.string().cuid("Invalid user ID format");

const emailSchema = z.string().email("Invalid email format");

module.exports = {
    createProfileSchema,
    updateProfileSchema,
    authSchema,
    userIdSchema,
    emailSchema,
};
