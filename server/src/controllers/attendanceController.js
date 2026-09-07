import { z } from "zod";
import AttendanceSubmission from "../models/AttendanceSubmission.js";
import Student from "../models/Student.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildClassName, buildSheetTitle, getMonthMeta, normalizeDate } from "../utils/dateUtils.js";
import { getMonthlySheetBuffer, getSheetData, updateDayColumn } from "../services/excelService.js";
import { createAndSendAbsenceNotifications } from "../services/notificationService.js";
import { logAudit } from "../services/auditService.js";

export const submitAttendanceSchema = z.object({
  body: z.object({
    className: z.string().min(1),
    date: z.string().optional(),
    entries: z
      .array(
        z.object({
          studentId: z.string().min(1),
          status: z.enum(["P", "A"]),
        }),
      )
      .min(1),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const getAttendanceSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    className: z.string().optional(),
    date: z.string().optional(),
    token: z.string().optional(),
  }),
});

export const getRegister = asyncHandler(async (req, res) => {
  const className = req.query.className || buildClassName(req.user.assignedClass || {});
  const date = normalizeDate(req.query.date);
  const submission = await AttendanceSubmission.findOne({ className, date });
  const students = await Student.find({ className, isActive: true }).sort({ rollNo: 1 });

  res.json({
    success: true,
    className,
    date,
    locked: Boolean(submission),
    submission,
    students,
  });
});

export const getSheet = asyncHandler(async (req, res) => {
  const className = req.query.className || buildClassName(req.user.assignedClass || {});
  const date = normalizeDate(req.query.date);

  if (!className) {
    const error = new Error("className is required");
    error.statusCode = 400;
    throw error;
  }

  const sheetData = await getSheetData({ className, date });
  res.json({ success: true, ...sheetData });
});

export const downloadAttendanceSheet = asyncHandler(async (req, res) => {
  const className = req.query.className || buildClassName(req.user.assignedClass || {});
  const date = normalizeDate(req.query.date);

  if (!className) {
    const error = new Error("className is required");
    error.statusCode = 400;
    throw error;
  }

  const { monthName, year } = getMonthMeta(date);
  const sheetTitle = buildSheetTitle(className, date);
  const buffer = await getMonthlySheetBuffer(sheetTitle, { className, date });

  if (!buffer) {
    const error = new Error("No attendance workbook could be generated for this class and month");
    error.statusCode = 404;
    throw error;
  }

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=${className}-${monthName}-${year}-attendance.xlsx`);
  res.send(Buffer.from(buffer));
});

export const submitAttendance = asyncHandler(async (req, res) => {
  const date = normalizeDate(req.body.date);
  const className = req.body.className;
  const existing = await AttendanceSubmission.findOne({ className, date });

  if (existing) {
    const error = new Error("Attendance is already submitted and locked for this date");
    error.statusCode = 409;
    throw error;
  }

  const students = await Student.find({ className, isActive: true }).sort({ rollNo: 1 });
  const studentById = new Map(students.map((student) => [String(student._id), student]));
  const entries = req.body.entries.map((entry) => {
    const student = studentById.get(entry.studentId);
    if (!student) {
      const error = new Error("Attendance includes a student outside this class");
      error.statusCode = 400;
      throw error;
    }
    return {
      student: student._id,
      rollNo: student.rollNo,
      name: student.name,
      status: entry.status,
    };
  });

  const { month, year, day } = getMonthMeta(date);
  const sheetTitle = buildSheetTitle(className, date);
  await updateDayColumn({ sheetTitle, students, day, entries, className, date });

  const submission = await AttendanceSubmission.create({
    className,
    date,
    month,
    year,
    day,
    teacher: req.user._id,
    sheetTitle,
    entries,
  });

  const absentIds = new Set(entries.filter((entry) => entry.status === "A").map((entry) => String(entry.student)));
  const absentees = students.filter((student) => absentIds.has(String(student._id)));
  const notifications = await createAndSendAbsenceNotifications({ absentees, submission, date });

  await logAudit({
    actor: req.user._id,
    action: "SUBMIT_ATTENDANCE",
    entity: "AttendanceSubmission",
    entityId: String(submission._id),
    metadata: { className, date, absentCount: absentees.length },
  });

  res.status(201).json({
    success: true,
    submission,
    absentees,
    notifications,
  });
});
