import dotenv from "dotenv";
dotenv.config();
import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.schema.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// PATCH endpoint to update user profile
router.patch("/", async (req, res) => {
  let token;
  let userId;

  // --- JWT Verification (In-Route Middleware Logic) ---
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
        .json({ message: "Not authorized, token failed or expired." });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided." });
  }
  // --- End JWT Verification ---

  try {
    const {
      jobEmail,
      jobPassword,
      cv,
      preferredIndustries, // Keep the old field name from frontend
      preferredRoles, // Keep the old field name from frontend
      preferredLocations, // Keep the old field name from frontend
      phonenumber,
    } = req.body;

    console.log("Received update data:", {
      preferredIndustries,
      preferredRoles,
      preferredLocations,
      jobEmail,
      jobPassword,
      cv,
    });

    // Create update object with proper string handling
    const updateFields = {};

    if (jobEmail !== undefined) updateFields.jobEmail = jobEmail;
    if (jobPassword !== undefined) updateFields.jobPassword = jobPassword;
    if (cv !== undefined) updateFields.cv = cv;

    // Handle string fields - map frontend field names to schema field names
    if (preferredIndustries !== undefined) {
      updateFields.preferredIndustries =
        typeof preferredIndustries === "string"
          ? preferredIndustries.trim()
          : "";
    }

    if (preferredRoles !== undefined) {
      updateFields.preferredRoles =
        typeof preferredRoles === "string" ? preferredRoles.trim() : "";
    }

    if (preferredLocations !== undefined) {
      updateFields.preferredLocations =
        typeof preferredLocations === "string" ? preferredLocations.trim() : "";
    }

    if (phonenumber !== undefined) updateFields.phonenumber = phonenumber;

    // Check if there are any fields to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No fields to update." });
    }

    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
      }
    )
      .select("-password")
      .exec();

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);

    // More detailed error logging
    if (error.name === "ValidationError") {
      console.error("Validation errors:", error.errors);
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate field value entered",
      });
    }

    res.status(500).json({
      message: "Server error while updating profile",
      error: error.message, // Include error message for debugging
    });
  }
});

export default router;
