// --- File: src/routes/jobRoutes.js ---

import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Import Models
import { User } from "../../customer/models/user.schema.js";
import { Job } from "../../customer/models/job.schema.js";
import { Assistant } from "../models/assistant.schema.js";

// Import email utilities
import { sendMail } from "../../utils/mail.js";
import NewApplication from "../../customer/templates/newJob.js";

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

// --- 🚀 POST / (Creates a new job application) ---
router.post("/", protect, async (req, res) => {
  const {
    client: clientId,
    title,
    company,
    jobUrl,
    appliedDate,
    notes,
    status,
    location,
    description,
    jobType,
    requiredSkills,
    salaryRange,
  } = req.body;

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
    }

    const isClientManaged = req.assistant.clients.some(
      (c) => c.toString() === clientId
    );

    if (!isClientManaged) {
      return res.status(403).json({
        message: "Unauthorized: Client is not linked to your account.",
      });
    }

    // 3. Create the New Job Application
    const newJob = await Job.create({
      title,
      company,
      jobUrl,
      description,
      jobSource: "Manual Entry",
      appliedDate: appliedDate ? new Date(appliedDate) : new Date(),
      status: status || "Pending",
      notes,
      location,
      jobType,
      requiredSkills,
      ...(salaryRange && { salaryRange }),
    });

    // 4. Link the Job to the Client (User)
    if (!client.jobs) client.jobs = [];
    client.jobs.push(newJob._id);
    await client.save();

    if (!req.assistant.jobs) req.assistant.jobs = [];
    req.assistant.jobs.push(newJob._id);
    await req.assistant.save();

    // 5. Send email notification to the client
    // Determine if the user is on the Free plan to conditionally show the subscribe CTA
    const isFreePlan = client.plan?.name === "Free";

    // Fire-and-forget: don't block the response on email delivery.
    // Wrap in try/catch so a mail failure never breaks the API response.
    try {
      await sendMail(
        client.email,
        `New Application: ${title} at ${company}`,
        "",
        NewApplication(client.firstname, title, company, isFreePlan)
      );
    } catch (mailError) {
      // Log but do not fail the request — the job was still created successfully
      console.error(
        `Failed to send new-application email to ${client.email}:`,
        mailError.message
      );
    }

    res.status(201).json({
      message: "Job application logged successfully.",
      job: newJob,
    });
  } catch (error) {
    console.error("Error creating job application:", error);

    if (error.name === "ValidationError") {
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