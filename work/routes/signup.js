import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Assistant } from "../models/assistant.schema.js";

const router = express.Router();
// NOTE: In a real application, load this from process.env
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  // 1. Basic Input Validation
  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({
      message:
        "All fields (firstname, lastname, email, password) are required.",
    });
  }

  try {
    // 2. Check for existing user by email
    const existingUser = await Assistant.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Account already exists with this email address." });
    }

    // 3. Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create new user document
    const newUser = new Assistant({
      firstname,
      lastname,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await newUser.save();

    // 5. Generate JWT Token for immediate login
    const payload = {
      id: newUser._id,
      email: newUser.email,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    // Remove password before sending the response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    // 6. Send Response
    res.status(201).json({
      token,
      user: userResponse,
      message: "Account created successfully.",
    });
  } catch (error) {
    // Handle Mongoose validation or other server errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error during account creation." });
  }
});

export default router;
