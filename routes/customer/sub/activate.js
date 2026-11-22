import dotenv from "dotenv";
dotenv.config();

import express from "express";
import jwt from "jsonwebtoken";
import Stripe from "stripe";

import { User } from "../../../models/user.schema.js";
import { Assistant } from "../../../models/assistant.schema.js";

// --- IMPORT: Email utilities ---
import { sendMail } from "../../../utils/mail.js";
import EmailTemplate from "../../../templates/emailTemplate.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Only available plans
const VALID_PLANS = ["Starter", "Professional"];

// POST endpoint to activate subscription and assign assistant
router.post("/", async (req, res) => {
  let token;
  let userId;

  // JWT Authentication
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch (error) {
      console.error("Token verification failed:", error.message);

      return res.status(401).json({
        message: "Not authorized, token failed or expired.",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      message: "Not authorized, no token provided.",
    });
  }

  // Session ID must come from frontend
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({
      message: "Stripe session ID is required.",
    });
  }

  const mongoSession = await User.startSession();

  try {
    // Retrieve and verify Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (!stripeSession) {
      return res.status(400).json({
        message: "Invalid Stripe checkout session.",
      });
    }

    // Ensure payment is completed
    if (
      stripeSession.payment_status !== "paid" ||
      stripeSession.status !== "complete"
    ) {
      return res.status(400).json({
        message: "Payment has not been completed.",
      });
    }

    // Verify that the checkout belongs to the authenticated user
    if (
      stripeSession.client_reference_id !== userId.toString() ||
      stripeSession.metadata?.userId !== userId.toString()
    ) {
      return res.status(403).json({
        message: "This payment session does not belong to this user.",
      });
    }

    // Get plan from Stripe metadata
    const planName = stripeSession.metadata?.planName;

    if (!VALID_PLANS.includes(planName)) {
      return res.status(400).json({
        message: "Invalid subscription plan.",
        validPlans: VALID_PLANS,
      });
    }

    // Verify expected amount and currency
    const expectedAmounts = {
      Starter: 5999,
      Professional: 12999,
    };

    if (
      stripeSession.currency !== "gbp" ||
      stripeSession.amount_total !== expectedAmounts[planName]
    ) {
      return res.status(400).json({
        message: "Payment amount or currency verification failed.",
      });
    }

    // Start transaction
    let result;
    let emailData = null; // captured inside the transaction, sent after commit

    await mongoSession.withTransaction(async () => {
      const user = await User.findById(userId).session(mongoSession);

      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
      }

      // Prevent duplicate activation of the same checkout session
      if (user.lastCheckoutSessionId === stripeSession.id) {
        result = {
          message: "This payment has already been activated.",
          user,
        };
        return;
      }

      // Check whether user already has an active subscription
      if (user.plan?.expiresAt && user.plan.expiresAt > new Date()) {
        const error = new Error("You already have an active subscription.");
        error.statusCode = 400;
        throw error;
      }

      const activatedAt = new Date();

      // One-time payment grants one month of access
      const expiresAt = new Date(activatedAt);
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      let assignedAssistant = null;

      // Reuse existing assistant if user already has one
      if (user.assistant) {
        assignedAssistant = await Assistant.findById(user.assistant).session(
          mongoSession,
        );
      }

      // Assign a new assistant only if user doesn't have one
      if (!assignedAssistant) {
        // Find assistants with fewer than 10 clients
        const availableAssistants = await Assistant.find({
          $expr: {
            $lt: [{ $size: { $ifNull: ["$clients", []] } }, 10],
          },
        })
          .select("_id clients firstname lastname specialization")
          .session(mongoSession);

        if (availableAssistants.length === 0) {
          const error = new Error(
            "No assistants available at the moment. Please try again later.",
          );
          error.statusCode = 503;
          throw error;
        }

        // Random assistant selection
        assignedAssistant =
          availableAssistants[
            Math.floor(Math.random() * availableAssistants.length)
          ];

        // Add user to assistant's clients
        await Assistant.updateOne(
          { _id: assignedAssistant._id },
          {
            $addToSet: {
              clients: user._id,
            },
          },
          { session: mongoSession },
        );

        user.assistant = assignedAssistant._id;
      }

      // Activate subscription
      user.plan = {
        name: planName,
        expiresAt,
        activatedAt,
      };

      // Record Stripe session to prevent duplicate activation
      user.lastCheckoutSessionId = stripeSession.id;

      await user.save({ session: mongoSession });

      // Capture data needed for the confirmation email (sent after commit)
      emailData = {
        email: user.email,
        firstname: user.firstname,
        planName,
        // Format amount in GBP (Stripe stores in pence)
        amountPaid: `£${(stripeSession.amount_total / 100).toFixed(2)}`,
        expiresAt: expiresAt.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      };

      result = {
        message: "Subscription activated successfully.",
        user: user.toObject(),
        assistant: {
          _id: assignedAssistant._id,
          firstname: assignedAssistant.firstname,
          lastname: assignedAssistant.lastname,
          specialization: assignedAssistant.specialization,
        },
      };
    });

    // --- SEND CONFIRMATION EMAIL (after transaction commits) ---
    // Skip if this was a duplicate activation (result.message check)
    if (emailData && result?.message === "Subscription activated successfully.") {
      try {
        const emailHtml = EmailTemplate({
          type: "subscription",
          firstname: emailData.firstname || "there",
          planName: emailData.planName,
          amountPaid: emailData.amountPaid,
          expiresAt: emailData.expiresAt,
          actionUrl: process.env.FRONTEND_URL,
        });

        await sendMail(
          emailData.email,
          `Your Jobbinex ${emailData.planName} Plan is Active`,
          "", // Plain text fallback
          emailHtml
        );
      } catch (mailError) {
        // Log but never fail the request — the subscription is already active
        console.error(
          `Failed to send subscription email to ${emailData.email}:`,
          mailError.message
        );
      }
    }

    console.log(
      `Subscription activated for user ${userId}, plan ${stripeSession.metadata.planName}`,
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error activating subscription:", error);

    if (error.type === "StripeInvalidRequestError") {
      return res.status(400).json({
        message: "Invalid Stripe session ID.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error.",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(error.statusCode || 500).json({
      message: error.message || "Server error while activating subscription.",
    });
  } finally {
    mongoSession.endSession();
  }
});

export default router;