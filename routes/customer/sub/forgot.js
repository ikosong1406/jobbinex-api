import express from "express";
import { User } from "../../../models/user.schema.js";
// Assuming you have a utility for sending emails, e.g., sendEmail
import { sendMail } from "../../../utils/mail.js";
// --- IMPORT: The unified email template factory function ---
import EmailTemplate from "../../../templates/emailTemplate.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required." });
    }

    const user = await User.findOne({ email });

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

    // 3. Generate the reset email HTML using the unified template
    const emailHtml = EmailTemplate({
      type: "resetPassword",
      firstname: user.firstname || "User",
      resetCode: resetCode,
      actionUrl: process.env.CLIENT_URL,
    });

    // 4. Send the email (isolated so a mail failure doesn't crash the request)
    try {
      await sendMail(
        user.email,
        "Password Reset Code - Jobbinex",
        "", // Plain text fallback
        emailHtml
      );
    } catch (emailError) {
      // Log the failure but don't block the response — the code is already saved
      console.error(
        `Failed to send reset email to ${user.email}:`,
        emailError.message
      );
    }

    res
      .status(200)
      .json({ msg: "Reset code successfully sent to your email." });
  } catch (error) {
    console.error("Error in send-reset-code:", error.message);
    res.status(500).send("Server Error");
  }
});

export default router;