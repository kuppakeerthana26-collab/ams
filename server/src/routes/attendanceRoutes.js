import express from "express";
import {
  getAttendanceSchema,
  getRegister,
  submitAttendance,
  submitAttendanceSchema,
} from "../controllers/attendanceController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/register", authorize("teacher", "admin"), validate(getAttendanceSchema), getRegister);
router.post("/submit", authorize("teacher", "admin"), validate(submitAttendanceSchema), submitAttendance);

export default router;
