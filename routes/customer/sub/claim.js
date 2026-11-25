import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../../../models/user.schema.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/", async (req, res) => {
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

  try {
    // 2. Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    // 3. Guard against double-claiming
    if (user.claimFree === true) {
      return res
        .status(409)
        .json({ msg: "You have already claimed your free application." });
    }

    // 4. Profile must be fully completed
    const hasPreferences =
      (Array.isArray(user.preferredIndustries) &&
        user.preferredIndustries.length > 0) ||
      (Array.isArray(user.preferredRoles) && user.preferredRoles.length > 0) ||
      (Array.isArray(user.preferredLocations) &&
        user.preferredLocations.length > 0);

    const profileCompleted = Boolean(
      user.firstname?.trim() &&
      user.lastname?.trim() &&
      user.phonenumber?.trim() &&
      user.jobProvider?.trim() &&
      user.jobEmail?.trim() &&
      user.jobPassword?.trim() &&
      typeof user.cv === "string" &&
      user.cv.trim().length > 0 &&
      hasPreferences,
    );

    if (!profileCompleted) {
      return res.status(400).json({
        msg: "Please complete your profile (including your CV) before claiming your free application.",
      });
    }

    // 5. Mark the free application as claimed
    user.claimedFree = true;
    await user.save();

    res.status(200).json({
      msg: "Free application claimed successfully.",
      claimedFree: user.claimedFree,
    });
  } catch (error) {
    console.error("Error in claim-free-application:", error.message);
    res.status(500).send("Server Error");
  }
});

export default router;
