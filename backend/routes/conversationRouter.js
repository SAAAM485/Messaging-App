const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/conversationController");
const jwtAuth = require("../middlewares/jwtAuth");

router.use(jwtAuth);

router.post("/:conversationId/read", conversationController.markAsRead);
router
    .route("/:conversationId/participants")
    .delete(conversationController.removeUserFromConversation)
    .get(conversationController.listParticipants)
    .post(conversationController.addUserToConversation);
router.get("/:conversationId", conversationController.getConversation);
router.post("/private", conversationController.findOrCreateConversation);
router.post("/group", conversationController.postGroupConversation);

module.exports = router;
