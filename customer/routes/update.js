import express from "express";
import mongoose from "mongoose";
import { Job } from "../models/job.schema.js";

const router = express.Router();

const ALLOWED_STATUSES = [
  "Pending",
  "Applied",
  "Interviewing",
  "Offer Received",
  "Rejected",
  "Hired",
  "Archived",
];

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { status, appliedDate } = req.body;

  // --- 1. Validation ---
  if (!status) {
    return res
      .status(400)
      .json({ message: "New status is required in the request body." });
  }
  if (!ALLOWED_STATUSES.includes(status)) {
    return res
      .status(400)
      .json({ message: `Invalid status provided: ${status}` });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid job ID format." });
  }

  try {
    // --- 2. Setup Update Fields ---
    const updateFields = {
      status: status,
      updatedAt: new Date(), // It's good practice to update the timestamp
    };

    // Only set/update appliedDate if it's explicitly passed in the body (e.g., when approving a 'Pending' job)
    if (appliedDate) {
      updateFields.appliedDate = new Date(appliedDate);
    }

    // --- 3. MongoDB Update (Directly on the Job Collection) ---
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true } // Return the updated document
    );

    // --- 4. Check Result ---
    if (!updatedJob) {
      return res
        .status(404)
        .json({ message: "Job not found in the database." });
    }

    res.status(200).json({
      message: "Job status updated successfully.",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Job Status Update Error:", error);
    res.status(500).json({ message: "Server error during job status update." });
  }
});

export default router;
