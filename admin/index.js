import { Router } from "express";
import login from "./routes/login.js";
import signup from "./routes/signup.js";
import getUsers from "./routes/getUsers.js";
import deleteAdmin from "./routes/deleteAdmin.js";
import getAdmin from "./routes/getAdmins.js";
import getPayments from "./routes/getPayments.js";
import getAssistant from "./routes/getAssistant.js";
import verifyPayment from "./routes/verifyPayment.js";

const router = Router();

router.use("/login", login);
router.use("/signup", signup);
router.use("/getUsers", getUsers);
router.use("/deleteAdmin", deleteAdmin);
router.use("/getAdmins", getAdmin);
router.use("/getPayments", getPayments);
router.use("/getAssistant", getAssistant);
router.use("/verifyPayment", verifyPayment);

export default router;
