const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const jwtAuth = require("../middlewares/jwtAuth");

router.use(jwtAuth);
router
    .route("/:conversationId")
    .post(messageController.postMessage)
    .get(messageController.getMessages);

module.exports = router;
