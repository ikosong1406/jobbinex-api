// --- File: src/routes/updateJobStatusRoutes.js ---

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

// --- 🚀 PATCH /:jobId/status (Update job status) ---
router.patch("/:jobId/status", protect, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;

    // 1. Validation
    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    const validStatuses = [
      "Applied",
      "Pending",
      "Interviewing",
      "Offer Received",
      "Rejected",
      "Hired",
      "Archived",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    // 2. Find job and check authorization
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Check if the assistant has access to this job through any of their clients
    const clientWithJob = await User.findOne({
      _id: { $in: req.assistant.clients },
      jobs: jobId,
    });

    if (!clientWithJob) {
      return res.status(403).json({
        message: "Unauthorized: Job is not accessible by this assistant.",
      });
    }

    // 3. Update the job status
    job.status = status;
    await job.save();

    res.status(200).json({
      message: "Job status updated successfully.",
      job,
    });
  } catch (error) {
    console.error("Error updating job status:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ message: "Validation failed.", errors: messages });
    }

    res
      .status(500)
      .json({ message: "Server error while updating job status." });
  }
});

export default router;
