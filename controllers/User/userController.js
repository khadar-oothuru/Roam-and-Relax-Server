const User = require("../../model/userModel");

const Booking = require("../../model/booking");
const jwt = require("jsonwebtoken");
const cloudinary = require("../../config/cloudinaryConfig");
const { userSignupValidation, userLoginValidation } = require("../../validations/userValidations");

// Signup Controller
const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    const { error } = userSignupValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered." });

    // Check if file is provided
    if (!req.file) {
      return res.status(400).json({ message: "Profile image is required" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, { folder: "profiles" });

    // Save user to database
    const user = new User({ username, email, password, profileImage: result.secure_url });
    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Login Controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    const { error } = userLoginValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT with username and profile image
    const token = jwt.sign(
      { id: user._id, username: user.username, profileImage: user.profileImage },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
// Get User Controller



const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};



const updateUser = async (req, res) => {
  try {
    const { username } = req.body;

    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update username if provided
    if (username) {
      user.username = username;
    }

    // Update profile image if a new file is provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "profiles" });
      user.profileImage = result.secure_url;
    }

    // Save updated user
    await user.save();

    // Generate a new JWT token with updated info
    const token = jwt.sign(
      { id: user._id, username: user.username, profileImage: user.profileImage },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    res.status(200).json({ message: "Profile updated successfully", token });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};



 
module.exports = { signup, login, getUser , updateUser}; 
