import express from "express";
import {
  getOverview,
  getDepartmentStats,
  getSectionsList,
  getSectionDetails,
  getStudentsDirectory,
  getStudentProfile,
  getDefaulters,
  getFacultyCompliance,
  getAttendanceTrends,
  exportExcel,
  exportDefaultersDocument,
} from "../controllers/dashboardController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Enforce authentication & management role access
router.use(protect);
router.use(authorize("admin", "hod", "dean", "principal"));

// Executive KPI & High-level analytics
router.get("/overview", getOverview);
router.get("/departments", getDepartmentStats);

// Section & class level breakdowns
router.get("/sections", getSectionsList);
router.get("/section-details/:className", getSectionDetails);

// Student directories & individual profiles
router.get("/students", getStudentsDirectory);
router.get("/student/:id", getStudentProfile);
router.get("/defaulters", getDefaulters);

// Faculty compliance & trend charts
router.get("/faculty-status", getFacultyCompliance);
router.get("/trends", getAttendanceTrends);

// Document & Excel exports
router.get("/export/excel", exportExcel);
router.get("/export/docx", exportDefaultersDocument);

export default router;
