import { Router } from "express";
import login from "./sub/login.js";
import signup from "./sub/signup.js";
import getUsers from "./sub/getUsers.js";
import deleteAdmin from "./sub/deleteAdmin.js";
import getAdmin from "./sub/getAdmins.js";
import getPayments from "./sub/getPayments.js";
import getAssistant from "./sub/getAssistant.js";
import verifyPayment from "./sub/verifyPayment.js";

import testEmail from "./sub/testEmail.js"; // Import the testEmail route

const router = Router();

router.use("/login", login);
router.use("/signup", signup);
router.use("/getUsers", getUsers);
router.use("/deleteAdmin", deleteAdmin);
router.use("/getAdmins", getAdmin);
router.use("/getPayments", getPayments);
router.use("/getAssistant", getAssistant);
router.use("/verifyPayment", verifyPayment);
router.use("/testEmail", testEmail); // Use the testEmail route

export default router;
