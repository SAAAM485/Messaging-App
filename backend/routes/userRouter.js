const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const jwtAuth = require("../middlewares/jwtAuth");

router.post("/auth/third-party", userController.thirdPartyLoginOrCreate);
router.get("/emails/:email", userController.getUserByEmail);
router.post("/", userController.createUserProfile);

router.use(jwtAuth);

router.patch("/last-seen", userController.updateLastSeen);
router.get("/conversations", userController.getUserConversations);
router
    .route("/")
    .get(userController.getUserProfile)
    .put(userController.updateUserProfile);

module.exports = router;
