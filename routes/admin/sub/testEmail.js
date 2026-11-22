import express from "express";
import EmailTemplate from "../../../templates/emailTemplate.js"; // Adjust path as needed

const router = express.Router();

// GET or POST route to preview the email HTML
router.post("/", (req, res) => {
  const { 
    type, 
    firstname, 
    jobTitle, 
    company, 
    isFreePlan, 
    resetCode, 
    adminMessage,
    // --- ADDED: Subscription variables ---
    planName,
    amountPaid,
    expiresAt
  } = req.body;

  try {
    // Generate the HTML using our unified template
    const html = EmailTemplate({
      type: type || 'general',
      firstname: firstname || 'Alexander',
      jobTitle: jobTitle || 'Senior Frontend Developer',
      company: company || 'TechCorp Inc.',
      isFreePlan: isFreePlan !== undefined ? isFreePlan : true,
      resetCode: resetCode || '849201',
      adminMessage: adminMessage || '<p>We have updated our Terms of Service. Please review them at your earliest convenience.</p>',
      // --- ADDED: Subscription variables with defaults ---
      planName: planName || 'Professional',
      amountPaid: amountPaid || '£129.99',
      expiresAt: expiresAt || '14 December 2026',
      actionUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
    });

    // Send the raw HTML back to the client
    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(html);

  } catch (error) {
    console.error("Email template test error:", error);
    return res.status(500).json({ 
      message: "Failed to generate email template", 
      error: error.message 
    });
  }
});

export default router;