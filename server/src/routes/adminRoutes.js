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

router.use(protect, authorize("admin"));
router.get("/statistics", validate(adminQuerySchema), statistics);
router.get("/absentees", validate(adminQuerySchema), absenteeHistory);
router.get("/sheet", validate(adminQuerySchema), sheetRows);
router.get("/reports/download", validate(adminQuerySchema), downloadReport);

export default router;
