import { z } from "zod";
import AttendanceSubmission from "../models/AttendanceSubmission.js";
import NotificationLog from "../models/NotificationLog.js";
import Student from "../models/Student.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildSheetTitle } from "../utils/dateUtils.js";
import { getSheetRows } from "../services/googleSheetsService.js";

export const adminQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    className: z.string().optional(),
    date: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const statistics = asyncHandler(async (req, res) => {
  const match = {};
  if (req.query.className) match.className = req.query.className;

  const [submissions, students, failedMessages] = await Promise.all([
    AttendanceSubmission.find(match).sort({ date: -1 }).limit(30),
    Student.countDocuments(req.query.className ? { className: req.query.className, isActive: true } : { isActive: true }),
    NotificationLog.countDocuments({ status: "failed" }),
  ]);

  const totalMarked = submissions.reduce((sum, item) => sum + item.entries.length, 0);
  const totalAbsent = submissions.reduce((sum, item) => sum + item.entries.filter((entry) => entry.status === "A").length, 0);

  res.json({
    success: true,
    stats: {
      students,
      submissions: submissions.length,
      totalMarked,
      totalAbsent,
      presentPercent: totalMarked ? Math.round(((totalMarked - totalAbsent) / totalMarked) * 100) : 0,
      failedMessages,
    },
    recentSubmissions: submissions,
  });
});

export const absenteeHistory = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.className) filter.className = req.query.className;

  const submissions = await AttendanceSubmission.find(filter).sort({ date: -1 }).limit(100);
  const history = submissions.flatMap((submission) =>
    submission.entries
      .filter((entry) => entry.status === "A")
      .map((entry) => ({
        date: submission.date,
        className: submission.className,
        rollNo: entry.rollNo,
        name: entry.name,
      })),
  );

  res.json({ success: true, history });
});

export const sheetRows = asyncHandler(async (req, res) => {
  if (!req.query.className || !req.query.date) {
    const error = new Error("className and date are required");
    error.statusCode = 400;
    throw error;
  }

  const rows = await getSheetRows(buildSheetTitle(req.query.className, req.query.date));
  res.json({ success: true, rows });
});

export const downloadReport = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.className) filter.className = req.query.className;

  const submissions = await AttendanceSubmission.find(filter).sort({ date: 1 });
  const lines = ["Date,Class,Roll No,Name,Status"];
  submissions.forEach((submission) => {
    submission.entries.forEach((entry) => {
      lines.push(`${submission.date},${submission.className},${entry.rollNo},"${entry.name.replaceAll('"', '""')}",${entry.status}`);
    });
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=attendance-report.csv");
  res.send(lines.join("\n"));
});
