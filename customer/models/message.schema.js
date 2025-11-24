// models/Message.js

import mongoose, { Schema } from "mongoose";

// --- 1. Subdocument Schema for a single Chat Entry (named 'conversationEntry') ---
// This schema defines the structure of each item in the 'conversation' array.
const conversationEntrySchema = new Schema(
  {
    // The role (user or assistant) who sent this specific chat entry
    role: {
      type: String,
      required: true,
      enum: ["user", "assistant"],
    },

    // The content of the entry
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },

    // Automatic timestamp for when this specific message was created/sent
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true } // Keep Mongoose ObjectId for array elements
);

// --- 2. Parent Schema for the Conversation Thread (named 'Message') ---
// This parent document holds the entire chat thread between the two parties.
const messageSchema = new Schema(
  {
    // ID of the User in this chat thread
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ID of the Assistant in this chat thread
    assistantId: {
      type: Schema.Types.ObjectId,
      ref: "Assistant",
      required: true,
      index: true,
    },

    // The sub-array where all individual chat entries will be stored
    // Per your request, this array is named 'conversation'
    conversation: {
      type: [conversationEntrySchema],
      default: [],
    },

    // Optional metadata fields
    title: {
      type: String,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds 'createdAt' (thread start) and 'updatedAt' (last array push)
  }
);

// We still recommend a unique compound index
messageSchema.index({ userId: 1, assistantId: 1 }, { unique: true });

// Export the Mongoose Model (named 'Message' as requested)
export const Message = mongoose.model("Message", messageSchema);
