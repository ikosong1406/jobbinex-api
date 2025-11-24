import dotenv from "dotenv";
dotenv.config();
import express from "express";
import jwt from "jsonwebtoken";
// Import all necessary models for population
import { User } from "../models/user.schema.js";
import { Job } from "../models/job.schema.js";
import { Assistant } from "../../work/models/assistant.schema.js";
import { Notification } from "../models/notification.schema.js";
import { Message } from "../models/message.schema.js";

const router = express.Router();
// NOTE: Ensure this matches the secret used in your login/signup routes
const JWT_SECRET = process.env.JWT_SECRET;

router.get("/", async (req, res) => {
  let token;
  let userId;

  // --- JWT Verification (In-Route Middleware Logic) ---
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id; // Extract user ID
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
  // --- End JWT Verification ---

  try {
    // --- Data Population Query ---
    const user = await User.findById(userId)
      // Never send sensitive credentials
      .select("-password")

      // Populate Jobs
      .populate({
        path: "jobs",
        model: Job,
      })
      // Populate Assistant
      .populate({
        path: "assistant",
        model: Assistant,
        select: "firstname lastname status",
      })
      // Populate Notifications
      .populate({
        path: "notifications",
        model: Notification,
        options: { sort: { createdAt: -1 } },
      })
      // Populate Conversations (referenced as 'messages' in User schema)
      .populate({
        path: "messages",
        model: Message,
        // Nested population to show the latest message in the conversation thread
        populate: {
          path: "messages",
          model: "Message",
          options: { limit: 1, sort: { createdAt: -1 } },
        },
      })
      .exec(); // Execute the query

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Send the fully populated user data to the frontend
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching populated user data:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching profile data." });
  }
});

export default router;
