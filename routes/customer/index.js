import { Router } from "express";
import signup from "./sub/signup.js";
import login from "./sub/login.js";
import userdata from "./sub/userdata.js";
import update from "./sub/update.js";
import sendMessage from "./sub/sendMesaage.js";
import forgot from "./sub/forgot.js";
import verify from "./sub/verify.js";
import reset from "./sub/reset.js";
import profile from "./sub/profile.js";
import checkout from "./sub/checkout.js";
import activate from "./sub/activate.js";
import createConv from "./sub/createConv.js";
import createPayment from "./sub/createPayment.js";

const router = Router();

router.use("/signup", signup);
router.use("/login", login);
router.use("/userdata", userdata);
router.use("/update", update);
router.use("/sendMessage", sendMessage);
router.use("/forgot", forgot);
router.use("/verify", verify);
router.use("/reset", reset);
router.use("/profile", profile);
router.use("/checkout", checkout);
router.use("/activate", activate);
router.use("/createConv", createConv);
router.use("/createPayment", createPayment);

export default router;
