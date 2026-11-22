import mongoose, { Schema } from "mongoose";

// --- Job Schema Definition ---

const jobSchema = new Schema(
  {
    // 1. Core Job Information
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    company: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, "Job description is required."],
    },
    jobUrl: {
      type: String,
      trim: true,
      default: null,
    },
    jobSource: {
      type: String,
      trim: true,
      default: "Manual Entry",
    },

    // 2. Technical and Financial Details
    salaryRange: {
      min: { type: Number, default: null },
      max: { type: Number, default: null },
      currency: { type: String, trim: true, default: "USD" },
    },
    jobType: {
      type: String,
    },
    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],

    // 3. Application Status and History
    status: {
      type: String,
      enum: [
        "Pending",
        "Applied",
        "Interviewing",
        "Offer Received",
        "Rejected",
        "Hired",
        "Archived",
      ],
      default: "Pending",
    },
    appliedDate: {
      type: Date,
      default: null,
    },

    // Tracking dates for interview stages
    interviewDates: [
      {
        date: { type: Date, required: true },
        type: {
          type: String,
          enum: ["Screening", "Technical", "Behavioral", "On-site"],
          default: "Screening",
        },
        notes: { type: String, maxlength: 1000 },
      },
    ],

    // 4. Application Documents & Notes
    coverLetter: {
      type: String, // Full text of the cover letter used for this specific application
      default: null,
      maxlength: 5000,
    },
    resumeLink: {
      type: String, // URL to the specific resume version used (if different from user's default CV)
      default: null,
    },
    notes: {
      type: String, // Personal notes about the job or interview process
      default: null,
      maxlength: 2000,
    },
  },
  {
    // Mongoose will automatically manage 'createdAt' (Job added date) and 'updatedAt'
    timestamps: true,
  }
);

// Export the Mongoose Model
export const Job = mongoose.model("Job", jobSchema);
