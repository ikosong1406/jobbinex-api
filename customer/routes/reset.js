import express from "express";
import { User } from "../models/user.schema.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res
        .status(400)
        .json({ msg: "Email, code, and new password are required." });
    }

    // Find the user and also confirm the code is not expired
    const user = await User.findOne({
      email,
      resetCode,
      resetCodeExpires: { $gt: Date.now() }, // Code must be greater than current time
    });

    if (!user) {
      return res
        .status(400)
        .json({ msg: "Verification failed. Code is invalid or expired." });
    }

    // 1. Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // 2. Clear the reset code fields
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;

    // 3. Save the updated user (new password)
    await user.save();

    res
      .status(200)
      .json({ msg: "Password successfully reset. You can now log in." });
  } catch (error) {
    console.error("Error in reset-password:", error.message);
    res.status(500).send("Server Error");
  }
});

export default router;
