import express from "express";
import { Message } from "../models/message.schema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { messageId, role, content } = req.body;
    // 1. Basic Validation
    if (!role || !content) {
      return res
        .status(400)
        .json({ msg: "Missing required fields: role and content." });
    }

    // Ensure role is one of the valid types (basic check)
    if (role !== "user" && role !== "assistant") {
      return res.status(400).json({ msg: "Invalid role specified." });
    }

    // 2. Find and Update the document using $push
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        $push: {
          conversation: {
            role,
            content,
            createdAt: new Date(), // Server-side timestamp
          },
        },
      },
      {
        new: true, // Return the updated document
        // Setting runValidators: false for simplicity,
        // but usually recommended to keep true if model validation is complex.
      }
    );

    // 3. Handle Not Found
    if (!updatedMessage) {
      return res.status(404).json({ msg: "Message thread not found." });
    }

    // 4. Success Response
    res.status(200).json({
      msg: "Message successfully added to thread.",
    });
  } catch (error) {
    console.error("Error adding message:", error.message);
    // Handle Mongoose cast error (e.g., if messageId is a bad format)
    if (error.name === "CastError") {
      return res.status(400).json({ msg: "Invalid message ID format." });
    }
    res.status(500).send("Server Error");
  }
});

export default router;
