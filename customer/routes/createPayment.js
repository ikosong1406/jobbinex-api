import dotenv from "dotenv";
dotenv.config();
import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.schema.js";
import { Payment } from "../models/payment.schema.js"; // Import your Payment model

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// POST /api/customer/payment/create-entry
router.post("/", async (req, res) => {
  let token;
  let userId;

  // --- JWT Verification (same as userdata endpoint) ---
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id; // Extract user ID
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, token failed or expired." });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token provided." });
  }
  // --- End JWT Verification ---

  try {
    // Extract data from request body
    const {
      planName,
      planPrice,
      planDuration = "/Monthly",
      paymentMethod = "stripe"
    } = req.body;

    // Validate required fields
    if (!planName || !planPrice) {
      return res.status(400).json({
        success: false,
        message: "Plan name and price are required."
      });
    }

    // Find user to get their details
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    // Check if there's an existing pending payment for this user
    const existingPendingPayment = await Payment.findOne({
      userId: user._id,
      status: "pending",
      createdAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) } // Last 30 minutes
    });

    if (existingPendingPayment) {
      return res.status(200).json({
        success: true,
        message: "Existing pending payment found.",
        paymentId: existingPendingPayment._id
      });
    }

    // Create new payment entry
    const payment = new Payment({
      userId: user._id,
      userFirstName: user.firstname,
      userLastName: user.lastname,
      userEmail: user.email,
      userPhone: user.phonenumber,
      planName,
      planPrice,
      planDuration,
      amount: planPrice,
      currency: "GBP",
      status: "pending",
      paymentMethod,
      createdAt: new Date()
    });

    // Save the payment to database
    await payment.save();

    // Send success response with payment ID
    res.status(201).json({
      success: true,
      message: "Payment entry created successfully.",
      paymentId: payment._id,
    });

  } catch (error) {
    console.error("Error creating payment entry:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating payment entry."
    });
  }
});

export default router;