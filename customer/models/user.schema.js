import mongoose, { Schema } from "mongoose";

// --- User Schema Definition ---

const userSchema = new Schema(
  {
    // 1. Core Identification & Authentication
    firstname: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    lastname: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
    },
    password: {
      type: String,
      select: false,
      minlength: 8,
    },
    phonenumber: {
      type: String,
      trim: true,
      maxlength: 20,
      default: null,
    },
    resetCode: {
      type: String,
      default: null,
    },
    resetCodeExpires: {
      type: Date,
      default: null,
    },

    // 2. Subscription/Plan Status
    plan: {
      name: {
        type: String,
        enum: ["Starter", "Professional", "Elite"], // Example plan names
      },
      expiresAt: {
        type: Date,
      },
    },

    // 3. Document/Reference Ids
    // These fields store references (IDs) to other collections, enabling easy population.
    jobs: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Job",
        },
      ],
      default: [],
    },

    assistant: {
      type: Schema.Types.ObjectId,
      ref: "Assistant", // Reference to a single Assistant model
      default: null,
    },
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: "Notification", // Reference to a Notification model
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message", // Reference to a Message/Chat Thread model
      },
    ],

    // 4. Job-Specific Credentials (Stored encrypted in production!)
    jobEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },
    jobPassword: {
      type: String,
      default: null,
    },

    // 5. Career Preferences
    cv: {
      type: String, // URL link to the CV/Resume file (e.g., stored on S3 or Firebase)
      default: null,
    },
    preferredIndustries: {
      type: String, // **NOW A SINGLE STRING**
      default: null, // **SET DEFAULT TO NULL**
    },
    preferredRoles: {
      type: String, // **NOW A SINGLE STRING**
      default: null, // **SET DEFAULT TO NULL**
    },
    preferredLocations: {
      type: String, // **NOW A SINGLE STRING**
      default: null, // **SET DEFAULT TO NULL**
    },
  },
  {
    // Mongoose will automatically manage 'createdAt' and 'updatedAt' fields
    timestamps: true,
  }
);

// Export the Mongoose Model using ES module syntax
export const User = mongoose.model("User", userSchema);
