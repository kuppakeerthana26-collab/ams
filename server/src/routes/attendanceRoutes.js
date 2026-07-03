import express from "express";
import {
  getAttendanceSchema,
  getRegister,
  downloadAttendanceSheet,
  submitAttendance,
  submitAttendanceSchema,
} from "../controllers/attendanceController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/register", authorize("teacher", "admin", "hod"), validate(getAttendanceSchema), getRegister);
router.get("/download", authorize("teacher", "admin", "hod"), validate(getAttendanceSchema), downloadAttendanceSheet);
router.post("/submit", authorize("teacher", "admin", "hod"), validate(submitAttendanceSchema), submitAttendance);

export default router;
