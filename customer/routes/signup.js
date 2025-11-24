import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// Adjust the path to your User model as necessary
import { User } from "../models/user.schema.js";

// --- IMPORT 1: The core Nodemailer utility ---
import { sendMail } from "../../utils/mail.js";
// --- IMPORT 2: The email template factory function ---
import Welcome from "../templates/welcomeTemplate.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/", async (req, res) => {
  const { firstname, lastname, email, phonenumber, password } = req.body;

  if (!firstname || !lastname || !email || !phonenumber || !password) {
    return res.status(400).json({
      message:
        "All fields (firstname, lastname, email, phonenumber, password) are required.",
    });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Account already exists with this email address." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstname,
      lastname,
      email: email.toLowerCase(),
      phonenumber,
      password: hashedPassword,
    });

    await newUser.save();

    // 1. Generate JWT Token
    const payload = {
      id: newUser._id,
      email: newUser.email,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    // Prepare response object
    const userResponse = newUser.toObject();
    delete userResponse.password;

    // --- EXECUTE EMAIL SENDING ---
    sendMail(
      newUser.email,
      "Welcome to Jobbinex",
      "",
      Welcome(newUser.firstname)
    );

    // 2. Send Response
    res.status(201).json({
      token,
      user: userResponse,
      message: "Account created successfully. Welcome email sent!",
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error during account creation." });
  }
});

export default router;
