import dotenv from "dotenv";
dotenv.config();
import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.schema.js";
import { Assistant } from "../../work/models/assistant.schema.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// POST endpoint to activate user subscription and assign assistant
router.post("/", async (req, res) => {
  let token;
  let userId;

  // JWT Verification
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed or expired." });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided." });
  }

  try {
    const { planName } = req.body;

    // Validate plan name
    if (!planName || !["Starter", "Professional", "Elite"].includes(planName)) {
      return res.status(400).json({ 
        message: "Invalid plan name",
        validPlans: ["Starter", "Professional", "Elite"]
      });
    }

    // Calculate expiration date (1 month from now)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    // Get all available assistants
    const availableAssistants = await Assistant.find({
      $or: [
        { clients: { $size: 0 } }, // Assistants with no clients
        { 
          clients: { $not: { $size: 0 } }, // Assistants with clients
          $expr: { $lt: [{ $size: "$clients" }, 10] } // But less than 10 clients (load balancing)
        }
      ]
    }).select("_id clients firstname lastname");

    if (availableAssistants.length === 0) {
      return res.status(503).json({ 
        message: "No assistants available at the moment. Please try again later." 
      });
    }

    // Select a random assistant for load balancing
    const randomAssistant = availableAssistants[
      Math.floor(Math.random() * availableAssistants.length)
    ];

    // Start a transaction to update both user and assistant
    const session = await User.startSession();
    let result;

    try {
      await session.withTransaction(async () => {
        // Update user with new plan and assigned assistant
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { 
            $set: { 
              plan: {
                name: planName,
                expiresAt: expiresAt
              },
              assistant: randomAssistant._id
            } 
          },
          { 
            new: true,
            runValidators: true,
            session
          }
        ).select("-password");

        if (!updatedUser) {
          throw new Error("User not found");
        }

        // Add user to assistant's clients array
        await Assistant.findByIdAndUpdate(
          randomAssistant._id,
          { 
            $addToSet: { 
              clients: userId 
            } 
          },
          { 
            session,
            new: true 
          }
        );

        result = {
          message: "Subscription activated successfully and assistant assigned",
          user: updatedUser,
          assistant: {
            _id: randomAssistant._id,
            firstname: randomAssistant.firstname,
            lastname: randomAssistant.lastname,
            specialization: randomAssistant.specialization
          }
        };
      });
    } finally {
      session.endSession();
    }

    console.log(`Subscription activated for user ${userId} with plan ${planName}, assigned to assistant ${randomAssistant._id}`);

    res.status(200).json(result);

  } catch (error) {
    console.error("Error activating subscription:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.message === "User not found") {
      return res.status(404).json({ message: "User not found." });
    }
    
    res.status(500).json({ 
      message: "Server error while activating subscription" 
    });
  }
});

export default router;