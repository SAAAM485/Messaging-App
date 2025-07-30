require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const port = process.env.PORT || 3000;
const app = express();

const corsOptions = {
    origin: [
        "http://localhost:5173",
        "https://saaam485.github.io",
        "https://messagingapp0730.netlify.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use((req, res, next) => {
    console.log("→", req.method, req.originalUrl);
    next();
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// 設定 Cross-Origin-Opener-Policy
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
});

const userRouter = require("./routes/userRouter");
const conversationRouter = require("./routes/conversationRouter");
const messageRouter = require("./routes/messageRouter");
const friendRouter = require("./routes/friendRouter");
app.use("/api/users", userRouter);
app.use("/api/conversations", conversationRouter);
app.use("/api/messages", messageRouter);
app.use("/api/friends", friendRouter);

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running at port http://localhost:${port}/`);
    });
}

module.exports = app; // Export the app for testing purposes
