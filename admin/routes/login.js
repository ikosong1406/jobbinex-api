import dotenv from "dotenv";
dotenv.config(); // ✅ Load env vars
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.schema.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET; // ✅ Safer
// 🔴 Consider using environment variables for security

router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await Admin.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "Admin doesn't exist" });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign({ email: user.email }, JWT_SECRET, {
      // expiresIn: "7d",
    });

    res.status(200).json({ status: "ok", data: token });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

export default router;
