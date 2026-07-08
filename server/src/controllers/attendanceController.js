import { z } from "zod";
import AttendanceSubmission from "../models/AttendanceSubmission.js";
import Student from "../models/Student.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildClassName, buildSheetTitle, getMonthMeta, normalizeDate } from "../utils/dateUtils.js";
import { updateDayColumn } from "../services/googleSheetsService.js";
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
    className: z.string().min(1),
    date: z.string().optional(),
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

export const downloadAttendanceSheet = asyncHandler(async (req, res) => {
  const className = req.query.className || buildClassName(req.user.assignedClass || {});
  const date = normalizeDate(req.query.date);

  if (!className) {
    const error = new Error("className is required");
    error.statusCode = 400;
    throw error;
  }

  const { month, year, monthName } = getMonthMeta(date);

  const [submissions, students] = await Promise.all([
    AttendanceSubmission.find({ className, month, year }),
    Student.find({ className, isActive: true }).sort({ rollNo: 1 }),
  ]);

  // Map of studentId -> Map of day -> status
  const attendanceMap = new Map();
  submissions.forEach((sub) => {
    const day = sub.day;
    sub.entries.forEach((entry) => {
      const studentId = String(entry.student);
      if (!attendanceMap.has(studentId)) {
        attendanceMap.set(studentId, new Map());
      }
      attendanceMap.get(studentId).set(day, entry.status);
    });
  });

  const lines = [];

  // Header 1: Class Name, <val>, "", "Attendance Sheet", 29 columns
  const headerRow1 = ["Class Name", className.replace(/_/g, " "), "", "Attendance Sheet", ...Array(29).fill("")];
  lines.push(headerRow1.join(","));

  // Header 2: Month, <val>, "", "Dates", 29 columns
  const headerRow2 = ["Month", `${monthName} ${year}`, "", "Dates", ...Array(29).fill("")];
  lines.push(headerRow2.join(","));

  // Header 3: Roll No, Name, 1-31
  const headerRow3 = ["Roll No", "Name", ...Array.from({ length: 31 }, (_, index) => String(index + 1))];
  lines.push(headerRow3.join(","));

  // Student rows
  students.forEach((student) => {
    const escapedName = `"${student.name.replaceAll('"', '""')}"`;
    const row = [student.rollNo, escapedName];
    for (let d = 1; d <= 31; d++) {
      const status = attendanceMap.get(String(student._id))?.get(d) || "";
      row.push(status);
    }
    lines.push(row.join(","));
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${className}-${monthName}-${year}-attendance.csv`);
  res.send(lines.join("\n"));
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
  await updateDayColumn({ sheetTitle, students, day, entries });

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
