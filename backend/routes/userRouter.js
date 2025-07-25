const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const jwtAuth = require("../middlewares/jwtAuth");
const upload = require("../middlewares/multer");

router.post("/auth/thirdparty", userController.thirdPartyLoginOrCreate);
router.post("/auth/login", userController.login);
router.post("/auth/register", userController.register);
router.get("/emails/:email", userController.getUserByEmail);

router.use(jwtAuth);

router.get("/profile/:name", userController.getUserByName);
router.get("/profile/userId/:userId", userController.getUserById);
router.patch("/lastseen", userController.updateLastSeen);
router.get("/conversations/group", userController.getUserGroupConversations);
router.get("/conversations", userController.getUserConversations);
router
    .route("/")
    .get(userController.getUserProfile)
    .put(upload.single("image"), userController.updateUserProfile);

module.exports = router;
