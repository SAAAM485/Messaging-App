const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const jwtAuth = require("../middlewares/jwtAuth");
const upload = require("../middlewares/multer");

router.use(jwtAuth);
router
    .route("/:conversationId")
    .post(upload.single("image"), messageController.postMessage)
    .get(messageController.getMessages);

module.exports = router;
