import express from "express";
import {
  loginParent,
  requestOtp,
  verifyOtpAndBindDevice,
  protectParent,
  getWards,
  getWardAttendance,
  resetDeviceBinding,
} from "../controllers/parentController.js";

const router = express.Router();

// Direct Parent Login (Username / Roll No + Mobile No + Password)
router.route("/auth/login").get(loginParent).post(loginParent);

// Legacy OTP compatibility
router.route("/auth/request-otp").get(requestOtp).post(requestOtp);
router.route("/auth/verify-otp").get(verifyOtpAndBindDevice).post(verifyOtpAndBindDevice);

// Protected Parent Endpoints (Requires valid Parent JWT)
router.get("/wards", protectParent, getWards);
router.get("/attendance/:studentId", protectParent, getWardAttendance);

// Administrative device reset endpoint
router.post("/admin/reset-device/:studentId", resetDeviceBinding);

export default router;
