const { toUserDTO, toConversationDTO, toUserPreview } = require("./DTOs");
const { userService, UserError } = require("../services/userService");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
            return res.status(200).json({
                success: true,
                data: toUserDTO(userProfile),
            });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 依 email 取得使用者 */
    getUserByEmail: async (req, res) => {
        const { email } = extractParams(req, ["email"]);
        try {
            const userProfile = await userService.getUserProfileByEmail(email);
            return res.status(200).json({
                success: true,
                data: toUserDTO(userProfile),
            });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 依 name 取得使用者 */
    getUserByName: async (req, res) => {
        const { name } = extractParams(req, ["name"]);
        try {
            const userProfiles = await userService.getUserProfileByName(name);
            return res.status(200).json({
                success: true,
                data: userProfiles.map(toUserPreview),
            });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 依 userId 取得使用者 */
    getUserById: async (req, res) => {
        const { userId } = extractParams(req, ["userId"]);
        try {
            const userProfile = await userService.getUserProfile(userId);
            return res.status(200).json({
                success: true,
                data: toUserDTO(userProfile),
            });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 建立新使用者 */
    createUserProfile: async (req, res) => {
        try {
            const newUser = await userService.createUserProfile(req.body);
            return res.status(201).json({
                success: true,
                data: toUserDTO(newUser),
            });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 更新使用者資料 */
    updateUserProfile: async (req, res) => {
        const userId = req.user.userId;

        // 先複製 req.body，避免直接修改 Express 的內部物件
        const data = { ...req.body };

        // 如果有上傳圖片就加入 imageUrl 欄位
        if (req.file) {
            data.imageUrl = `/uploads/profile/${req.file.filename}`;
        }

        try {
            const updatedUser = await userService.updateUserProfile(
                userId,
                data
            );
            return res.status(200).json({
                success: true,
                data: toUserDTO(updatedUser),
            });
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

    /** 取得使用者的群組對話 */
    getUserGroupConversations: async (req, res) => {
        const userId = req.user.userId;
        try {
            const conversations = await userService.getUserGroupConversations(
                userId
            );
            return res.status(200).json({
                success: true,
                data: conversations.map(toConversationDTO),
            });
        } catch (err) {
            return handleError(err, res);
        }
    },

    /** 取得使用者的所有單人對話 */
    getUserConversations: async (req, res) => {
        const userId = req.user.userId;
        try {
            const conversations = await userService.getConversations(userId);
            return res.status(200).json({
                success: true,
                data: conversations.map(toConversationDTO),
            });
        } catch (err) {
            return handleError(err, res);
        }
    },

    thirdPartyLoginOrCreate: async (req, res) => {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ error: "Missing credential" });
        }

        try {
            // 驗證 Google ID Token
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();

            const provider = "GOOGLE";
            const providerId = payload.sub;
            const email = payload.email;
            const name = payload.name;
            const image = payload.picture;

            // 建立或取得本地 user
            const user = await userService.findOrCreateAuthUserProfile(
                provider,
                providerId,
                email,
                name,
                image
            );

            // 發出你自己的 JWT
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

            return res.status(200).json({
                success: true,
                data: { user: toUserPreview(user), token },
            });
        } catch (err) {
            console.error(err);
            return res.status(401).json({ error: "Invalid Google token" });
        }
    },

    login: async (req, res) => {
        const { email, password } = req.body;
        console.log(
            "Login attempt with email:",
            email,
            password ? "provided" : "not provided"
        );
        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Email and password required" });
        }

        try {
            const user = await userService.login(email, password);
            console.log("User found:", user);
            const token = jwt.sign(
                {
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                },
                process.env.JWT_SECRET,
                { expiresIn: "120h" }
            );

            return res.status(200).json({
                success: true,
                data: { user: toUserPreview(user), token },
            });
        } catch (err) {
            return handleError(err, res);
        }
    },

    register: async (req, res) => {
        const { email, password, name } = req.body;
        console.log(
            "Register attempt with email:",
            email,
            password ? "provided" : "not provided",
            name ? "provided" : "not provided"
        );
        if (!email || !password || !name) {
            return res
                .status(400)
                .json({ error: "Email, password and name required" });
        }

        try {
            const newUser = await userService.createUserProfile({
                email,
                password,
                name,
            });
            console.log("New user created:", newUser);

            const token = jwt.sign(
                {
                    userId: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                },
                process.env.JWT_SECRET,
                { expiresIn: "120h" }
            );

            return res.status(201).json({
                success: true,
                data: { user: toUserPreview(newUser), token },
            });
        } catch (err) {
            return handleError(err, res);
        }
    },
};

module.exports = userController;
