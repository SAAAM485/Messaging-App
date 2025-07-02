const { userService, UserError } = require("../services/userService");
const jwt = require("jsonwebtoken");

// 共用錯誤處理
const handleError = (err, res) => {
    if (err instanceof UserError) {
        return res.status(err.message.includes("not found") ? 404 : 400).json({
            success: false,
            error: {
                code: "USER_ERROR",
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

// 參數解構中介
const extractParams = (req, keys) =>
    keys.reduce((acc, key) => {
        if (req.params[key] !== undefined) {
            acc[key] = req.params[key];
        } else if (req.body && req.body[key] !== undefined) {
            acc[key] = req.body[key];
        }
        return acc;
    }, {});

const userController = {
    /** 取得使用者檔案 */
    getUserProfile: async (req, res) => {
        const userId = req.user.userId;
        try {
            const userProfile = await userService.getUserProfile(userId);
            return res.status(200).json({ success: true, data: userProfile });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 依 email 取得使用者 */
    getUserByEmail: async (req, res) => {
        const { email } = extractParams(req, ["email"]);
        try {
            const userProfile = await userService.getUserProfileByEmail(email);
            return res.status(200).json({ success: true, data: userProfile });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 建立新使用者 */
    createUserProfile: async (req, res) => {
        try {
            const newUser = await userService.createUserProfile(req.body);
            return res.status(201).json({ success: true, data: newUser });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 更新使用者資料 */
    updateUserProfile: async (req, res) => {
        const userId = req.user.userId;
        try {
            const updatedUser = await userService.updateUserProfile(
                userId,
                req.body
            );
            return res.status(200).json({ success: true, data: updatedUser });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 更新最後上線時間 */
    updateLastSeen: async (req, res) => {
        const userId = req.user.userId;
        try {
            await userService.touchLastSeen(userId);
            return res.status(200).json({
                success: true,
                data: { message: "Last seen updated." },
            });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 取得使用者的所有對話 */
    getUserConversations: async (req, res) => {
        const userId = req.user.userId;
        try {
            const conversations = await userService.getConversations(userId);
            return res.status(200).json({ success: true, data: conversations });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 第三方登入或建立 */
    thirdPartyLoginOrCreate: async (req, res) => {
        const { provider, providerId, email, name, image } = req.body;
        try {
            const user = await userService.findOrCreateAuthUserProfile(
                provider,
                providerId,
                email,
                name,
                image
            );
            // 簽發 JWT
            const token = jwt.sign(
                {
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                    provider: provider,
                },
                process.env.JWT_SECRET,
                { expiresIn: "120h" }
            );
            return res
                .status(200)
                .json({ success: true, data: { user, token } });
        } catch (err) {
            return handleError(err, res);
        }
    },
};

module.exports = userController;
