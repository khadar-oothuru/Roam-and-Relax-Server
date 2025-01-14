const express = require("express");
const { signup, login, getUser,} = require("../controllers/User/userController"); // Ensure correct path
const authMiddleware = require("../middlewares/authMiddleware"); // Check middleware definition
const upload = require("../middlewares/multerConfig"); // Check multer config

const router = express.Router();

// Routes
router.post("/signup", upload.single("profileImage"), signup);
router.post("/login", login);
router.get("/user", authMiddleware, getUser);


module.exports = router;
