// --- File: src/routes/getClientJobsRoutes.js ---

import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Import Models
import { User } from "../../customer/models/user.schema.js";
import { Job } from "../../customer/models/job.schema.js";
import { Assistant } from "../models/assistant.schema.js";

dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// --- 🔒 Middleware for JWT Authentication and Assistant Data Retrieval ---
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.assistantId = decoded.id;

      req.assistant = await Assistant.findById(req.assistantId).select(
        "-password -jobs -notifications -messages"
      );

      if (!req.assistant) {
        return res
          .status(401)
          .json({ message: "Not authorized, assistant user not found." });
      }
      next();
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
};

// --- 🚀 GET /:clientId (Get all jobs for a specific client) ---
router.get("/:clientId", protect, async (req, res) => {
  try {
    const { clientId } = req.params;

    // 1. Client and Authorization Check
    const client = await User.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }

    // Ensure the client is managed by the logged-in assistant
    const isClientManaged = req.assistant.clients.some(
      (c) => c.toString() === clientId
    );

    if (!isClientManaged) {
      return res.status(403).json({
        message: "Unauthorized: Client is not linked to your account.",
      });
    }

    // 2. Fetch all jobs for this client
    const jobs = await Job.find({ _id: { $in: client.jobs || [] } })
      .sort({ appliedDate: -1 }) // Sort by most recent first
      .select("-__v"); // Exclude version key

    res.status(200).json({
      message: "Jobs retrieved successfully.",
      jobs,
    });
  } catch (error) {
    console.error("Error fetching client jobs:", error);
    res.status(500).json({ message: "Server error while fetching jobs." });
  }
});

export default router;
