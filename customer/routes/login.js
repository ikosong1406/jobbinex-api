import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// Assuming your User model is located here
import { User } from "../models/user.schema.js";

const router = express.Router();
// IMPORTANT: Replace 'YOUR_SECRET_JWT_KEY' with a strong, complex key
// stored in your environment variables (e.g., process.env.JWT_SECRET)
const JWT_SECRET = process.env.JWT_SECRET;

// --- POST /api/auth/login ---
router.post("/", async (req, res) => {
  const { email, password } = req.body;

  // 1. Basic Input Validation
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    // 2. Find User by Email
    // We use .select('+password') to explicitly retrieve the password hash,
    // as it was set to select: false in the schema for security.
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      // Use a generic message to prevent leaking information about which emails exist
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // 3. Compare Passwords
    // Use bcrypt.compare to check the provided password against the stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // 4. Generate JWT Token
    // Create a payload with essential, non-sensitive user info
    const payload = {
      id: user._id,
      email: user.email,
      // Include roles/permissions here if your app has them
    };

    const token = jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: "1d" } // Token expires in 1 day
    );

    // Remove the password hash before sending the user data back
    user.password = undefined;

    // 5. Send Response
    res.status(200).json({
      token,
      message: "Login successful.",
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login process." });
  }
});

export default router;
