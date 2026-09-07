import express from "express";
import {
  absenteeHistory,
  adminQuerySchema,
  downloadReport,
  sheetRows,
  statistics,
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/statistics", authorize("admin", "hod"), validate(adminQuerySchema), statistics);
router.get("/absentees", authorize("admin", "hod", "teacher"), validate(adminQuerySchema), absenteeHistory);
router.get("/sheet", authorize("admin", "hod", "teacher"), validate(adminQuerySchema), sheetRows);
router.get("/reports/download", authorize("admin", "hod", "teacher"), validate(adminQuerySchema), downloadReport);

export default router;
