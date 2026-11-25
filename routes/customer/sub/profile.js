import dotenv from "dotenv";
dotenv.config();
import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../../../models/user.schema.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// PATCH endpoint to update user profile
router.patch("/", async (req, res) => {
  let token;
  let userId;

  // --- JWT Verification (In-Route Middleware Logic) ---
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.slice(7).trim();
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
      jobProvider,
      jobEmail,
      jobPassword,
      cv,
      preferredIndustries,
      preferredRoles,
      preferredLocations,
      phonenumber,
    } = req.body;

    const updateFields = {};

    if (jobProvider !== undefined) updateFields.jobProvider = jobProvider;
    if (jobEmail !== undefined) updateFields.jobEmail = jobEmail;
    if (jobPassword !== undefined) updateFields.jobPassword = jobPassword;
    if (cv !== undefined) updateFields.cv = cv;
    if (phonenumber !== undefined) updateFields.phonenumber = phonenumber;

    // ── ARRAY FIELDS ────────────────────────────────────────────
    // Accept arrays, comma-separated strings, or single values,
    // and always store a clean, de-duplicated array of trimmed strings.
    const toCleanArray = (value) => {
      if (value === undefined) return undefined;

      if (Array.isArray(value)) {
        return [
          ...new Set(
            value
              .filter((v) => typeof v === "string" || typeof v === "number")
              .map((v) => String(v).trim())
              .filter(Boolean),
          ),
        ];
      }

      if (typeof value === "string") {
        return [
          ...new Set(
            value
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean),
          ),
        ];
      }

      // Reject anything else (objects, numbers-as-single, etc.)
      return undefined;
    };

    const industries = toCleanArray(preferredIndustries);
    if (industries !== undefined) updateFields.preferredIndustries = industries;

    const roles = toCleanArray(preferredRoles);
    if (roles !== undefined) updateFields.preferredRoles = roles;

    const locations = toCleanArray(preferredLocations);
    if (locations !== undefined) updateFields.preferredLocations = locations;
    // ────────────────────────────────────────────────────────────

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No fields to update." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true },
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
      error: error.message,
    });
  }
});

export default router;