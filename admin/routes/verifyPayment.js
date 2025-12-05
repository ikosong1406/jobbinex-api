import express from "express";
import { Payment } from "../../customer/models/payment.schema.js";
import { User } from "../../customer/models/user.schema.js";
import { Assistant } from "../../work/models/assistant.schema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { paymentId, status } = req.body;

    // Validate required fields
    if (!paymentId || !status) {
      return res.status(400).json({
        error: "Payment ID and status are required.",
      });
    }

    // Validate status
    const validStatuses = ["completed", "failed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Must be 'completed' or 'failed'.",
      });
    }

    // Find the payment
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ error: "Payment not found." });
    }

    // Check if payment is already processed
    if (payment.status === "completed" || payment.status === "failed") {
      return res.status(400).json({
        error: "Payment has already been processed.",
      });
    }

    // Update payment with verification info
    const updateData = {
      status,
      completedAt: new Date(),
    };

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      updateData,
      { new: true }
    );

    // If payment is approved, assign plan to user and assign assistant
    if (status === "completed") {
      // Find the user
      const user = await User.findById(payment.userId);

      if (!user) {
        return res
          .status(404)
          .json({ error: "User not found for this payment." });
      }

      // Calculate plan expiry date (30 days from now for monthly plans)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Update user with plan
      user.plan = {
        name: payment.planName,
        expiresAt,
      };

      // Find ALL assistants (no status filter since you don't have status field)
      const assistants = await Assistant.find({});

      if (assistants.length > 0) {
        // Find assistant with least clients for balanced workload
        const assistantsWithClientCount = assistants.map((assistant) => {
          const clientCount = assistant.clients ? assistant.clients.length : 0;
          return { assistant, clientCount };
        });

        // Sort by client count (ascending) and pick the first one
        assistantsWithClientCount.sort((a, b) => a.clientCount - b.clientCount);
        const selectedAssistant = assistantsWithClientCount[0].assistant;

        // Assign assistant to user
        user.assistant = selectedAssistant._id;

        // Add user to assistant's clients if not already there
        if (!selectedAssistant.clients.includes(user._id)) {
          selectedAssistant.clients.push(user._id);
          await selectedAssistant.save();
        }
      } else {
        console.warn("No assistants found in database.");
      }

      await user.save();

      // Return success response with all updates
      return res.status(200).json({
        success: true,
        message: "Payment verified and user plan assigned successfully.",
        data: {
          userId: user._id,
          assistantId: user.assistant,
          plan: user.plan,
        },
      });
    }

    // For failed payments, just return success
    return res.status(200).json({
      status: "ok",
      message: "Payment verification completed.",
      data: {
        payment: updatedPayment,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      error: "Server error during payment verification.",
      details: error.message,
    });
  }
});

export default router;
