const jwt = require("jsonwebtoken");
const User = require("../model/userModel")
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ error: "Access denied" });
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(verified.id).select("-password");

        if (!req.user) {
            return res.status(404).json({ error: "User not found" });
        }

        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = authMiddleware;
