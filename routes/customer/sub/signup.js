import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// Adjust the path to your User model as necessary
import { User } from "../../../models/user.schema.js";
import { Assistant } from "../../../models/assistant.schema.js";

// --- IMPORT 1: The core Nodemailer utility ---
import { sendMail } from "../../../utils/mail.js";
// --- IMPORT 2: The unified email template factory function ---
import EmailTemplate from "../../../templates/emailTemplate.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Constants
const REFERRAL_REWARD = 3; // amount credited to the referrer
const MAX_REFERRAL_ATTEMPTS = 20; // attempts to generate a unique code

/**
 * Sanitize a name into an uppercase alphanumeric prefix.
 * - Removes non-alphanumeric chars (spaces, hyphens, apostrophes, etc.)
 * - Uppercases everything
 * - Falls back to "USER" if the result is empty
 */
const sanitizeName = (name) => {
  const cleaned = (name || "")
    .normalize("NFKD") // decompose accents (é -> e + accent)
    .replace(/[\u0300-\u036f]/g, "") // strip accent marks
    .replace(/[^a-zA-Z0-9]/g, "") // keep only letters/digits
    .toUpperCase();
  return cleaned || "USER";
};

/**
 * Generate a referral code from the user's first name + 4 random digits.
 * Format: e.g. "JOHN4821"
 * Retries on collision to guarantee uniqueness.
 */
const generateReferralCode = async (firstname) => {
  const prefix = sanitizeName(firstname);
  for (let attempt = 0; attempt < MAX_REFERRAL_ATTEMPTS; attempt++) {
    // 4-digit random number, zero-padded (0000–9999)
    const digits = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const code = `${prefix}${digits}`;

    const exists = await User.exists({ referralCode: code });
    if (!exists) return code;
  }

  // Fallback after max attempts: use a longer numeric suffix to avoid collision
  // e.g. "JOHN4821937" — extremely unlikely to hit, but guarantees termination
  return `${prefix}${Date.now().toString().slice(-6)}`;
};

router.post("/", async (req, res) => {
  const { firstname, lastname, email, phonenumber, password, referralCode } =
    req.body;

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

    // NEW: generate a referral code from the first name + 4 digits
    const newReferralCode = await generateReferralCode(firstname);

    const newUser = new User({
      firstname,
      lastname,
      email: email.toLowerCase(),
      phonenumber,
      password: hashedPassword,
      referralCode: newReferralCode,
      balance: 0,
      // Default plan on signup
      plan: {
        name: "Free",
        expiresAt: null, // Free plan doesn't expire
      },
    });

    // Assign an assistant upon signup (reuse subscription logic)
    let assignedAssistant = null;

    const availableAssistants = await Assistant.find({
      $expr: {
        $lt: [{ $size: { $ifNull: ["$clients", []] } }, 10],
      },
    }).select("_id clients firstname lastname specialization");

    if (availableAssistants.length > 0) {
      assignedAssistant =
        availableAssistants[
          Math.floor(Math.random() * availableAssistants.length)
        ];

      await Assistant.updateOne(
        { _id: assignedAssistant._id },
        { $addToSet: { clients: newUser._id } },
      );

      newUser.assistant = assignedAssistant._id;
    } else {
      console.warn(
        `No assistants available to assign to new user ${newUser.email}`,
      );
    }

    await newUser.save();

    // NEW: handle the referrer credit (after the user is saved successfully)
    if (referralCode && referralCode.trim()) {
      try {
        const normalizedReferralCode = referralCode.trim().toUpperCase();
        const referrer = await User.findOne({
          referralCode: normalizedReferralCode,
        });

        if (referrer && referrer._id.toString() !== newUser._id.toString()) {
          referrer.balance =
            (referrer.balance || 0) + REFERRAL_REWARD;
          await referrer.save();
        } else if (
          referrer &&
          referrer._id.toString() === newUser._id.toString()
        ) {
          console.warn(
            `Self-referral attempted by ${newUser.email} with code ${normalizedReferralCode}`,
          );
        } else {
          console.warn(
            `Referral code ${normalizedReferralCode} not found for new user ${newUser.email}`,
          );
        }
      } catch (referralError) {
        // Don't fail the signup if the referral credit fails
        console.error(
          `Failed to credit referrer for code ${referralCode}:`,
          referralError.message,
        );
      }
    }

    // 1. Generate JWT Token
    const payload = {
      id: newUser._id,
      email: newUser.email,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    // Prepare response object
    const userResponse = newUser.toObject();
    delete userResponse.password;

    // --- EXECUTE EMAIL SENDING (ISOLATED) ---
    try {
      const welcomeHtml = EmailTemplate({
        type: "welcome",
        firstname: newUser.firstname,
        actionUrl: process.env.FRONTEND_URL,
      });

      await sendMail(
        newUser.email,
        "Welcome to Jobbinex",
        "", // Plain text fallback
        welcomeHtml,
      );
    } catch (emailError) {
      console.error(
        `Failed to send welcome email to ${newUser.email}:`,
        emailError.message,
      );
    }

    // 2. Send Response
    res.status(201).json({
      token,
      message: "Account created successfully. Welcome email sent!",
      referralCode: newUser.referralCode,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    // Handle duplicate key errors (e.g. referralCode collision, email race)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || "field";
      return res.status(409).json({
        message: `A duplicate value for ${field} already exists. Please try again.`,
      });
    }

    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error during account creation." });
  }
});

export default router;