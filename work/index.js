import { Router } from "express";
import signup from "./routes/signup.js";
import login from "./routes/login.js";
import userdata from "./routes/assistantdata.js";
// import update from "./routes/update.js";
import sendMessage from "./routes/sendmessage.js";
import forgot from "./routes/forgot.js";
import verify from "./routes/verify.js";
import reset from "./routes/reset.js";
import newJob from "./routes/newJob.js";

const router = Router();

router.use("/signup", signup);
router.use("/login", login);
router.use("/userdata", userdata);
// router.use("/update", update);
router.use("/sendMessage", sendMessage);
router.use("/forgot", forgot);
router.use("/verify", verify);
router.use("/reset", reset);
router.use("/newJob", newJob);

export default router;
