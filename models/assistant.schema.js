import mongoose, { Schema } from "mongoose";

// --- Assistant Schema Definition ---

const assistantSchema = new Schema(
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
      // Prevents the password hash from being returned by default query results
      select: false,
      minlength: 8,
    },

    // 2. Status
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "online",
    },
    resetCode: {
      type: String,
      default: null,
    },
    resetCodeExpires: {
      type: Date,
      default: null,
    },

    // 3. Document/Reference Ids
    // These fields store references (IDs) to other collections, enabling easy population.
    clients: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // Reference to the User model (who the assistant helps)
      },
    ],
    jobs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Job", // Reference to a Job model
      },
    ],
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
  },
  {
    // Mongoose will automatically manage 'createdAt' and 'updatedAt' fields
    timestamps: true,
  }
);

// Export the Mongoose Model using ES module syntax
export const Assistant = mongoose.model("Assistant", assistantSchema);
