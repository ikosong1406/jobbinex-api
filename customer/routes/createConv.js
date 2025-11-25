import dotenv from "dotenv";
dotenv.config();
import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.schema.js";
import { Assistant } from "../../work/models/assistant.schema.js";
import { Message } from "../models/message.schema.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/", async (req, res) => {
  let token;
  let userId;

  // JWT Verification
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
    const { assistantId } = req.body;

    if (!assistantId) {
      return res.status(400).json({ message: "Assistant ID is required." });
    }

    // Get user to check if they already have an assistant assigned
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify the assistant exists
    const assistant = await Assistant.findById(assistantId);
    if (!assistant) {
      return res.status(404).json({ message: "Assistant not found." });
    }

    // Check if conversation already exists between user and assistant
    const existingConversation = await Message.findOne({
      userId: userId,
      assistantId: assistantId,
    });

    if (existingConversation) {
      return res.status(200).json({
        message: "Conversation already exists",
        conversation: existingConversation,
      });
    }

    // Create new conversation
    const newConversation = new Message({
      userId: userId,
      assistantId: assistantId,
      conversation: [],
      title: "New Conversation",
      lastActivityAt: new Date(),
    });

    const savedConversation = await newConversation.save();

    // Add conversation reference to user's messages array
    user.messages.push(savedConversation._id);
    await user.save();

    // **CRITICAL: Add conversation reference to assistant's messages array**
    assistant.messages = assistant.messages || []; // Ensure messages array exists
    assistant.messages.push(savedConversation._id);
    await assistant.save();

    // Populate the response with assistant details
    const populatedConversation = await Message.findById(savedConversation._id)
      .populate({
        path: "assistantId",
        select: "firstname lastname status",
      })
      .exec();

    res.status(201).json({
      message: "Conversation created successfully",
      conversation: populatedConversation,
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res
      .status(500)
      .json({ message: "Server error while creating conversation." });
  }
});

export default router;