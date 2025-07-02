const express = require("express");
const router = express.Router();
const friendController = require("../controllers/friendController");
const jwtAuth = require("../middlewares/jwtAuth");

router.use(jwtAuth);
router
    .route("/friendships/:friendId")
    .get(friendController.getFriendship)
    .post(friendController.sendFriendRequest);
router.get("/friendships", friendController.getAllAcceptedFriendship);

router
    .route("/friend-requests/:requestId")
    .patch(friendController.confirmFriendRequest)
    .delete(friendController.deleteFriendRequest);
router.get("/friend-requests/sent", friendController.getAllSentRequests);
router.get("/friend-requests", friendController.getAllReceivedRequests);

module.exports = router;
