import mongoose, { Schema } from "mongoose";

// --- Notification Schema Definition ---
const notificationSchema = new Schema(
  {
    // 2. Notification Details
    message: {
      type: String,
      maxlength: 500,
    },

    // Categorization of the notification (e.g., system alert, new message, update)
    type: {
      type: String,
      enum: ["message", "job", "plan", "system", "application", "general"],
      default: "general",
    },
  },
  {
    timestamps: true, // Adds 'createdAt' (when notification was created) and 'updatedAt'
  }
);

// Export the Mongoose Model
export const Notification = mongoose.model("Notification", notificationSchema);
