import express from "express";
import { Assistant } from "../models/assistant.schema.js";

const router = express.Router();

/**
 * @route POST /auth/password/verify-reset-code
 * @desc Accepts email and code, verifies against the user document.
 * @access Public
 */
router.post("/", async (req, res) => {
  try {
    const { email, resetCode } = req.body;

    if (!email || !resetCode) {
      return res
        .status(400)
        .json({ msg: "Email and reset code are required." });
    }

    const user = await Assistant.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    // 1. Check for valid code and expiration
    if (user.resetCode !== resetCode) {
      return res.status(400).json({ msg: "Invalid reset code." });
    }

    if (user.resetCodeExpires && user.resetCodeExpires < Date.now()) {
      // Optionally clear the code after expiration
      user.resetCode = undefined;
      user.resetCodeExpires = undefined;
      await user.save();
      return res
        .status(400)
        .json({ msg: "Reset code has expired. Please request a new one." });
    }

    // 2. Success: The code is valid.
    res.status(200).json({ msg: "Code verified successfully." });
  } catch (error) {
    console.error("Error in verify-reset-code:", error.message);
    res.status(500).send("Server Error");
  }
});

export default router;
