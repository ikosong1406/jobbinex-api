import express from "express";
import { Assistant } from '../models/assistant.schema.js'
// Assuming you have a utility for sending emails, e.g., sendEmail
import { sendMail } from "../../utils/mail.js";
import Reset from "../../customer/templates/forgotTemplate.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required." });
    }

    const user = await Assistant.findOne({ email });

    if (!user) {
      // NOTE: For security, it's often better to send a generic success message
      // even if the user is not found, to prevent email enumeration.
      return res.status(404).json({
        msg: "User not found, please signup.",
      });
    }

    // 1. Generate a 4-digit code (simple random number)
    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();

    // 2. Set the code and expiration time on the user document (e.g., 10 minutes)
    user.resetCode = resetCode;
    user.resetCodeExpires = Date.now() + 600000; // 10 minutes from now
    await user.save();

    // 3. Send the email (Implementation assumed in utils/emailService.js)
    const emailHtml = Reset(user.firstname || "User", resetCode);

    sendMail(user.email, "Password Reset Code - Jobbinex", "", emailHtml);

    res
      .status(200)
      .json({ msg: "Reset code successfully sent to your email." });
  } catch (error) {
    console.error("Error in send-reset-code:", error.message);
    res.status(500).send("Server Error");
  }
});

export default router;
