import express from "express";
import bcrypt from "bcryptjs";
import Admin from "../models/admin.schema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  try {
    // Check if driver already exists
    const oldAdmin = await Admin.findOne({ email });
    if (oldAdmin) {
      return res.status(400).json({
        status: "error",
        message: "Admin already exists with this email",
      });
    }

    // Hash password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Create new driver
    const newDriver = await Admin.create({
      firstname,
      lastname,
      email,
      password: encryptedPassword,
    });

    return res.status(201).json({
      status: "success",
      message: "Admin registration successful",
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    return res.status(500).json({
      status: "error",
      message: "Registration failed",
    });
  }
});

export default router;
