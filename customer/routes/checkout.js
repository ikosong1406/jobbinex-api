import dotenv from "dotenv";
dotenv.config();
import express from "express";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import { User } from "../models/user.schema.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const CLIENT_URL = process.env.CLIENT_URL || "https://app.jobbinex.com";

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// NOTE: We are now using price_data for one-time payments.
// If you create a product and price in the Stripe dashboard for one-time payments,
// you can replace price_data with the price ID (e.g., price: 'price_xxxxxxxxxxxxxx').
const PLANS = {
  Starter: {
    price_data: {
      currency: "gbp",
      // unit_amount: 4999,
      unit_amount: 100,
      product_data: {
        name: "Starter One-Time Access",
        description: "One-time fee for Starter benefits.",
      },
      // Removed: recurring property
    },
  },
  Professional: {
    price_data: {
      currency: "gbp",
      unit_amount: 9999, // £99.99
      product_data: {
        name: "Professional One-Time Access",
        description: "One-time fee for Professional benefits.",
      },
    },
  },
  Elite: {
    price_data: {
      currency: "gbp",
      unit_amount: 24999, // £249.99
      product_data: {
        name: "Elite One-Time Access",
        description: "One-time fee for Elite benefits.",
      },
    },
  },
};

// POST endpoint to create Stripe checkout session
router.post("/", async (req, res) => {
  let token;
  let userId;

  // JWT Verification (Your existing authentication logic)
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

  try {
    const { planName } = req.body;

    if (!PLANS[planName]) {
      return res.status(400).json({
        message: "Invalid plan name",
        validPlans: Object.keys(PLANS),
      });
    }

    const user = await User.findById(userId).select("email firstname lastname");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const plan = PLANS[planName];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          // Using price_data is acceptable for one-time payment mode
          price_data: plan.price_data,
          quantity: 1,
        },
      ],
      // ✨ KEY CHANGE 1: Set mode to 'payment' for one-time purchases
      mode: "payment",

      // The rest of the URLs and metadata remain helpful
      success_url: `${CLIENT_URL}/customer/profile?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/customer/profile?canceled=true`,
      customer_email: user.email,
      client_reference_id: userId.toString(),
      metadata: {
        userId: userId.toString(),
        planName: planName,
        userEmail: user.email,
      },
      allow_promotion_codes: true,
      // Removed: subscription_data field
    });

    console.log(session);

    res.status(200).json({
      sessionId: session.id,
      redirectUrl: session.url,
      message: "Checkout session created successfully",
    });
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);

    if (error.type === "StripeInvalidRequestError") {
      return res.status(400).json({
        message: "Invalid Stripe request",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Server error while creating checkout session",
    });
  }
});

export default router;
