// Import necessary modules
const express = require("express");
const { signup, login, getUser, updateUser } = require("../controllers/User/userController"); 
const authMiddleware = require("../middlewares/authMiddleware"); 
const upload = require("../middlewares/multerConfig"); 

const router = express.Router();

// Routes
router.post("/signup", upload.single("profileImage"), signup);
router.post("/login", login);
router.get("/user", authMiddleware, getUser);
router.put("/update", authMiddleware, upload.single("profileImage"), updateUser);

module.exports = router;
