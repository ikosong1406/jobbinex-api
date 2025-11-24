// --- File: src/routes/jobRoutes.js (Example Path) ---

import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Import Models
import { User } from "../../customer/models/user.schema.js"; // Your Client Model
import { Job } from "../../customer/models/job.schema.js";
import { Assistant } from "../models/assistant.schema.js"; // Your Assistant/User Model

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
      req.assistantId = decoded.id; // Retrieve and attach the assistant user to the request

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

// --- 🚀 POST / (Creates a new job application) ---
// This route is responsible for logging a new job application for a specific client.
router.post("/", protect, async (req, res) => {
  const {
    client: clientId, // The client's _id (User model)
    title,
    company,
    jobUrl,
    appliedDate,
    notes,
    status, // --- NEW JOB SCHEMA FIELDS ADDED ---
    location,
    description, // Required by schema
    jobType,
    requiredSkills, // Expected as an array from the frontend
    salaryRange, // Expected as { min: number, max: number, currency: string } // -------------------------------------
  } = req.body; // 1. Basic Validation (Updated to include 'description' which is required by the schema)

  if (!clientId || !title || !company) {
    return res.status(400).json({
      message:
        "Required fields missing: client ID, job title, company, and job description.",
    });
  }

  try {
    // 2. Client and Authorization Check
    const client = await User.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    } // Ensure the client is managed by the logged-in assistant

    const isClientManaged = req.assistant.clients.some(
      (c) => c.toString() === clientId
    );

    if (!isClientManaged) {
      return res.status(403).json({
        message: "Unauthorized: Client is not linked to your account.",
      });
    } // 3. Create the New Job Application

    const newJob = await Job.create({
      // Core Information
      title,
      company,
      jobUrl, // Optional URL
      description, // Required
      jobSource: "Manual Entry", // Status & History

      appliedDate: appliedDate ? new Date(appliedDate) : new Date(),
      status: status || "Pending",
      notes, // Max 2000 chars // Technical and Financial Details

      location,
      jobType,
      requiredSkills, // Array of strings // Conditional Salary Range (Mongoose handles the nested object structure)
      ...(salaryRange && { salaryRange }),
    }); // 4. Link the Job to the Client (User)

    // --- Ensure arrays exist before pushing ---
    if (!client.jobs) client.jobs = [];
    client.jobs.push(newJob._id);
    await client.save();

    if (!req.assistant.jobs) req.assistant.jobs = [];
    req.assistant.jobs.push(newJob._id);
    await req.assistant.save();

    res.status(201).json({
      message: "Job application logged successfully.",
      job: newJob,
    });
  } catch (error) {
    console.error("Error creating job application:", error); // Handle specific Mongoose validation errors

    if (error.name === "ValidationError") {
      // Map error messages from Mongoose validation object
      const messages = Object.values(error.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ message: "Validation failed.", errors: messages });
    }

    res
      .status(500)
      .json({ message: "Server error while creating job application." });
  }
});

export default router;
