import { Router } from "express";
import signup from "./routes/signup.js";
import login from "./routes/login.js";
import userdata from "./routes/userdata.js";
import update from "./routes/update.js";
import sendMessage from "./routes/sendMesaage.js";
import forgot from "./routes/forgot.js";
import verify from "./routes/verify.js";
import reset from "./routes/reset.js";
import profile from "./routes/profile.js";
import checkout from "./routes/checkout.js";
import subscribe from "./routes/subscribe.js";
import createConv from "./routes/createConv.js";
import createPayment from "./routes/createPayment.js";

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
router.use("/subscribe", subscribe);
router.use("/createConv", createConv);
router.use("/createPayment", createPayment);

export default router;
