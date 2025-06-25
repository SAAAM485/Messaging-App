const {
    getUserById,
    getUserByEmail,
    createUser,
    updateProfile,
    updateLastSeen,
    listConversations,
    findOrCreateAuthUser,
} = require("../db/queries/user");

const {
    createProfileSchema,
    updateProfileSchema,
    authSchema,
    userIdSchema,
    emailSchema,
} = require("../validations/userValidation");

// 自訂錯誤類別，方便 Controller 區分
class UserError extends Error {
    constructor(message) {
        super(message);
        this.name = "UserError";
    }
}

const userService = {
    /**
     * 取得使用者檔案
     */
    getUserProfile: async (userId) => {
        // 驗證 userId
        const validatedUserId = userIdSchema.parse(userId);
        const user = await getUserById(validatedUserId);
        if (!user) throw new UserError("User not found.");
        return user;
    },

    /**
     * 依 email 取得使用者
     */
    getUserProfileByEmail: async (email) => {
        const validatedEmail = emailSchema.parse(email);
        const user = await getUserByEmail(validatedEmail);
        if (!user) throw new UserError("User not found for given email.");
        return user;
    },

    /**
     * 建立新使用者
     */
    createUserProfile: async (data) => {
        // 驗證輸入完整性
        const validated = createProfileSchema.parse(data);
        return createUser(validated);
    },

    /**
     * 更新使用者資料
     */
    updateUserProfile: async (userId, data) => {
        const validatedUserId = userIdSchema.parse(userId);
        const validated = updateProfileSchema.parse(data);
        const updated = await updateProfile({
            id: validatedUserId,
            data: validated,
        });
        if (!updated) throw new UserError("Failed to update user profile.");
        return updated;
    },

    /**
     * 更新最後上線時間
     */
    touchLastSeen: async (userId) => {
        const validatedUserId = userIdSchema.parse(userId);
        return updateLastSeen(validatedUserId);
    },

    /**
     * 取得會話列表
     */
    getConversations: async (userId, rawParams = {}) => {
        const validatedUserId = userIdSchema.parse(userId);
        return listConversations(validatedUserId);
    },

    /**
     * 第三方登入或建立
     */
    findOrCreateAuthUserProfile: async (
        provider,
        providerId,
        email,
        name,
        image
    ) => {
        const validated = authSchema.parse({
            provider,
            providerId,
            email,
            name,
            image,
        });
        return findOrCreateAuthUser(
            validated.provider,
            validated.providerId,
            validated.email,
            validated.name,
            validated.image
        );
    },
};

module.exports = { userService, UserError };
