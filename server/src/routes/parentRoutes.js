import express from "express";
import {
  requestOtp,
  verifyOtpAndBindDevice,
  protectParent,
  getWards,
  getWardAttendance,
  resetDeviceBinding,
} from "../controllers/parentController.js";

const router = express.Router();

// Public Parent Auth & Device Binding endpoints
router.post("/auth/request-otp", requestOtp);
router.post("/auth/verify-otp", verifyOtpAndBindDevice);

// Protected Parent Endpoints (Requires valid Parent JWT + Device Match)
router.get("/wards", protectParent, getWards);
router.get("/attendance/:studentId", protectParent, getWardAttendance);

// Administrative device reset endpoint (when parent gets a replacement phone)
router.post("/admin/reset-device/:studentId", resetDeviceBinding);

export default router;
