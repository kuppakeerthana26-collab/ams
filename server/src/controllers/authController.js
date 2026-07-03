import { z } from "zod";
import Teacher from "../models/Teacher.js";
import generateToken from "../utils/generateToken.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logAudit } from "../services/auditService.js";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  assignedClass: user.assignedClass,
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await Teacher.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  await logAudit({ actor: user._id, action: "LOGIN", entity: "Teacher", entityId: String(user._id) });

  res.json({
    success: true,
    token: generateToken(user),
    user: publicUser(user),
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});
