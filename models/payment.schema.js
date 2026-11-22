import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // User Information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    userFirstName: {
      type: String,
    },

    userLastName: {
      type: String,
    },

    userEmail: {
      type: String,
    },

    userPhone: {
      type: String,
    },

    // Plan Information
    planName: {
      type: String,
    },

    planPrice: {
      type: Number,
    },

    planDuration: {
      type: String,
      default: "/Monthly",
    },

    // Payment Details
    amount: {
      type: Number,
    },

    currency: {
      type: String,
      default: "GBP",
    },

    // Payment Status
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "canceled"],
      default: "pending",
    },

    // Payment Method
    paymentMethod: {
      type: String,
      default: "stripe",
    },

    // Stripe Information
    stripeSessionId: {
      type: String,
    },

    stripePaymentIntentId: {
      type: String,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model("Payment", paymentSchema);
