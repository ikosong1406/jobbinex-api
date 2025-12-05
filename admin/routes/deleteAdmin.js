import express from "express";
import Admin from "../models/admin.schema.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { id } = req.body;

    // Find and delete the admin by their ID
    const deletedAdmin = await Admin.findByIdAndDelete(id);

    // If the admin was not found, return an error
    if (!deletedAdmin) {
      return res.status(404).json({ error: "Admin not found." });
    }

    // Return a success message
    res.status(200).json({ status: "ok", message: "Admin deleted successfully.", data: deletedAdmin });
  } catch (error) {
    // Handle errors, such as an invalid ID format
    res.status(500).json({ error: "Server error.", details: error.message });
  }
});

export default router;