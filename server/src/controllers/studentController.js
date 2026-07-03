import { z } from "zod";
import Student from "../models/Student.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logAudit } from "../services/auditService.js";

const phoneRegex = /^\+?[1-9]\d{9,14}$/;

export const upsertStudentSchema = z.object({
  body: z.object({
    rollNo: z.string().min(1),
    name: z.string().min(2),
    className: z.string().min(1),
    parentPhone: z.string().regex(phoneRegex, "Parent phone must be in international format"),
  }),
  params: z.object({ id: z.string().optional() }).optional(),
  query: z.object({}).optional(),
});

export const listStudentsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    className: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const listStudents = asyncHandler(async (req, res) => {
  const { className, search } = req.query;
  const filter = { isActive: true };
  if (className) filter.className = className;
  if (search) {
    filter.$or = [
      { name: new RegExp(search, "i") },
      { rollNo: new RegExp(search, "i") },
      { parentPhone: new RegExp(search, "i") },
    ];
  }

  const students = await Student.find(filter).sort({ className: 1, rollNo: 1 });
  res.json({ success: true, students });
});

export const createStudent = asyncHandler(async (req, res) => {
  const student = await Student.create(req.body);
  await logAudit({ actor: req.user._id, action: "CREATE_STUDENT", entity: "Student", entityId: String(student._id) });
  res.status(201).json({ success: true, student });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }
  await logAudit({ actor: req.user._id, action: "UPDATE_STUDENT", entity: "Student", entityId: String(student._id) });
  res.json({ success: true, student });
});
