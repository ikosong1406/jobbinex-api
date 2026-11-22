import { Router } from "express";
import signup from "./sub/signup.js";
import login from "./sub/login.js";
import userdata from "./sub/assistantdata.js";
import sendMessage from "./sub/sendmessage.js";
import forgot from "./sub/forgot.js";
import verify from "./sub/verify.js";
import reset from "./sub/reset.js";
import newJob from "./sub/newJob.js";
import getClientJobsRoutes from "./sub/clientJob.js";
import updateJobStatusRoutes from "./sub/editJob.js";
import createConv from "./sub/createConv.js";

const router = Router();

router.use("/signup", signup);
router.use("/login", login);
router.use("/userdata", userdata);
router.use("/sendMessage", sendMessage);
router.use("/forgot", forgot);
router.use("/verify", verify);
router.use("/reset", reset);
router.use("/newJob", newJob);
router.use("/getClientJobs", getClientJobsRoutes); // New route
router.use("/updateJobStatus", updateJobStatusRoutes);
router.use("/createConv", createConv);

export default router;
