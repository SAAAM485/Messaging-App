const jwt = require("jsonwebtoken");

const jwtAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ error: "Authorization header missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // 附加到 req 供後續使用
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};

module.exports = jwtAuth;
