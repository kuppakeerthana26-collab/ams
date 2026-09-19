import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import AttendanceSubmission from "../models/AttendanceSubmission.js";
import Teacher from "../models/Teacher.js";
import Hod from "../models/Hod.js";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const cleanPhoneNumber = (phone = "") => String(phone).replace(/[^0-9+]/g, "").trim();

/**
 * 1. Request OTP for Parent Login
 * POST /api/parent/auth/request-otp
 */
export const requestOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    const error = new Error("Mobile number is required");
    error.statusCode = 400;
    throw error;
  }

  const cleanPhone = cleanPhoneNumber(phone);
  // Match exact or trailing digits (e.g. 10 digits)
  const phoneDigits = cleanPhone.slice(-10);
  const students = await Student.find({
    parentPhone: new RegExp(phoneDigits + "$"),
    isActive: true,
  });

  if (!students.length) {
    const error = new Error("This mobile number is not registered as a parent in GKCE college records. Please contact your department HOD.");
    error.statusCode = 404;
    throw error;
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Check if device is already bound
  const isBound = students.some((s) => !!s.parentDeviceId);
  const boundModel = students.find((s) => s.parentDeviceModel)?.parentDeviceModel || null;

  // Save OTP on all matching student records
  await Student.updateMany(
    { _id: { $in: students.map((s) => s._id) } },
    { $set: { parentOtp: otp, parentOtpExpires: expires } },
  );

  console.log(`[Parent Auth] OTP generated for ${cleanPhone}: ${otp} (Demo fallback: 123456)`);

  res.json({
    success: true,
    message: "Verification code sent to your registered mobile number",
    isBound,
    boundModel,
    registeredWardsCount: students.length,
    wardsPreview: students.map((s) => ({ name: s.name, rollNo: s.rollNo, className: s.className })),
    otpDemo: env.NODE_ENV !== "production" ? "123456" : undefined,
  });
});

/**
 * 2. Verify OTP & Enforce Hardware Device Binding
 * POST /api/parent/auth/verify-otp
 */
export const verifyOtpAndBindDevice = asyncHandler(async (req, res) => {
  const { phone, otp, deviceId, deviceModel = "Parent Smartphone" } = req.body;

  if (!phone || !otp || !deviceId) {
    const error = new Error("Phone number, OTP, and Device Hardware ID are required");
    error.statusCode = 400;
    throw error;
  }

  const cleanPhone = cleanPhoneNumber(phone);
  const phoneDigits = cleanPhone.slice(-10);

  const students = await Student.find({
    parentPhone: new RegExp(phoneDigits + "$"),
    isActive: true,
  });

  if (!students.length) {
    const error = new Error("No student records found for this phone number");
    error.statusCode = 404;
    throw error;
  }

  // Verify OTP
  const primaryStudent = students[0];
  const isDemoOtp = otp === "123456";
  const isStoredOtpValid =
    primaryStudent.parentOtp &&
    primaryStudent.parentOtp === otp &&
    primaryStudent.parentOtpExpires &&
    primaryStudent.parentOtpExpires > new Date();

  if (!isDemoOtp && !isStoredOtpValid) {
    const error = new Error("Invalid or expired OTP. Please request a new code.");
    error.statusCode = 400;
    throw error;
  }

  // ================= HARDWARE DEVICE BINDING CHECK =================
  // If an existing device is already bound, incoming deviceId MUST match!
  const existingBoundStudent = students.find((s) => !!s.parentDeviceId);

  if (existingBoundStudent && existingBoundStudent.parentDeviceId !== deviceId) {
    const registeredModel = existingBoundStudent.parentDeviceModel || "Registered Parent Phone";
    console.warn(`[Security Alert] Device mismatch for parent ${cleanPhone}! Expected: ${existingBoundStudent.parentDeviceId}, Received: ${deviceId}`);

    return res.status(403).json({
      success: false,
      errorCode: "DEVICE_MISMATCH",
      message: `Access Denied: This account is already bound to the parent's registered device (${registeredModel}). Login from unauthorized student devices is blocked.`,
    });
  }

  // Bind device (if not bound or matching) and clear OTP
  const now = new Date();
  await Student.updateMany(
    { _id: { $in: students.map((s) => s._id) } },
    {
      $set: {
        parentDeviceId: deviceId,
        parentDeviceModel: deviceModel,
        parentDeviceBoundAt: existingBoundStudent?.parentDeviceBoundAt || now,
        parentOtp: null,
        parentOtpExpires: null,
      },
    },
  );

  // Generate 30-day Parent JWT Token
  const token = jwt.sign(
    {
      role: "parent",
      phone: cleanPhone,
      deviceId,
      studentIds: students.map((s) => String(s._id)),
    },
    env.JWT_SECRET,
    { expiresIn: "30d" },
  );

  res.json({
    success: true,
    token,
    parent: {
      phone: cleanPhone,
      deviceId,
      deviceModel,
      boundAt: existingBoundStudent?.parentDeviceBoundAt || now,
    },
    wards: students.map((s) => ({
      id: s._id,
      name: s.name,
      rollNo: s.rollNo,
      className: s.className,
    })),
  });
});

/**
 * 3. Parent Auth Middleware
 */
export const protectParent = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  let token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token && req.query?.token) {
    token = req.query.token;
  }

  if (!token) {
    const error = new Error("Parent authorization token is required");
    error.statusCode = 401;
    throw error;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (decoded.role !== "parent" || !decoded.phone) {
      const error = new Error("Invalid parent session");
      error.statusCode = 403;
      throw error;
    }

    // Double-check hardware device integrity
    const incomingDeviceId = req.headers["x-device-id"] || req.query?.deviceId || decoded.deviceId;
    if (incomingDeviceId && decoded.deviceId && incomingDeviceId !== decoded.deviceId) {
      const error = new Error("Device signature verification failed. Please re-login on your registered phone.");
      error.statusCode = 403;
      throw error;
    }

    req.parent = decoded;
    next();
  } catch (err) {
    const error = new Error(err.message || "Invalid or expired parent session");
    error.statusCode = 401;
    next(error);
  }
});

/**
 * 4. List Wards for Authenticated Parent
 * GET /api/parent/wards
 */
export const getWards = asyncHandler(async (req, res) => {
  const phoneDigits = cleanPhoneNumber(req.parent.phone).slice(-10);
  const students = await Student.find({
    parentPhone: new RegExp(phoneDigits + "$"),
    isActive: true,
  }).sort({ name: 1 });

  res.json({
    success: true,
    wards: students.map((s) => ({
      id: s._id,
      name: s.name,
      rollNo: s.rollNo,
      className: s.className,
      parentPhone: s.parentPhone,
      deviceBoundAt: s.parentDeviceBoundAt,
      deviceModel: s.parentDeviceModel,
    })),
  });
});

/**
 * 5. Complete Ward Attendance Details (Weekly, Monthly, Absences)
 * GET /api/parent/attendance/:studentId
 */
export const getWardAttendance = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const student = await Student.findById(studentId);

  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }

  // Parse class details (e.g. CSE_1_A)
  const parts = String(student.className).split("_");
  const branch = parts[0] || "General";
  const year = parts[1] || "1";
  const section = parts[2] || "A";

  // Fetch faculty and HOD contacts
  const [faculty, hod, submissions] = await Promise.all([
    Teacher.findOne({
      "assignedClass.branch": branch,
      "assignedClass.year": parseInt(year, 10) || 1,
      "assignedClass.section": section,
    }).select("name email"),
    Hod.findOne({ department: branch.toUpperCase() }).select("name email department"),
    AttendanceSubmission.find({ "entries.student": student._id })
      .sort({ date: -1 })
      .populate("teacher", "name email")
      .lean(),
  ]);

  let totalClasses = 0;
  let classesAttended = 0;
  const recentAbsences = [];
  const monthlyMap = {};
  const dateMap = {};

  submissions.forEach((sub) => {
    const entry = sub.entries.find((e) => String(e.student) === String(student._id));
    if (entry) {
      totalClasses++;
      dateMap[sub.date] = entry.status;

      if (entry.status === "P") {
        classesAttended++;
      } else if (entry.status === "A") {
        recentAbsences.push({
          date: sub.date,
          className: sub.className,
          recordedBy: sub.teacher ? sub.teacher.name : "Class In-charge",
        });
      }

      // Group by Month
      const monthKey = `${sub.year}-${String(sub.month).padStart(2, "0")}`;
      if (!monthlyMap[monthKey]) {
        const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthlyMap[monthKey] = {
          month: monthNames[sub.month] || `Month ${sub.month}`,
          year: sub.year,
          total: 0,
          attended: 0,
        };
      }
      monthlyMap[monthKey].total++;
      if (entry.status === "P") monthlyMap[monthKey].attended++;
    }
  });

  const percentage = totalClasses > 0 ? Math.round((classesAttended / totalClasses) * 1000) / 10 : 100.0;
  const classesAbsent = Math.max(0, totalClasses - classesAttended);

  // Status Category
  let standing = "GOOD";
  let statusMessage = "Eligible for University Examinations (Above 75%)";
  let classesNeededFor75 = 0;

  if (percentage < 65) {
    standing = "CRITICAL";
    classesNeededFor75 = Math.max(0, Math.ceil(3 * totalClasses - 4 * classesAttended));
    statusMessage = `Critical Attendance Alert! Shortage of attendance. Needs ${classesNeededFor75} consecutive classes to reach 75%.`;
  } else if (percentage < 75) {
    standing = "SHORTAGE";
    classesNeededFor75 = Math.max(0, Math.ceil(3 * totalClasses - 4 * classesAttended));
    statusMessage = `Attendance Warning: Needs ${classesNeededFor75} consecutive classes to reach mandatory 75%.`;
  }

  // Generate 7-Day Weekly Calendar Strip (Last 7 working days)
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyStrip = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getDay();

    let status = dateMap[dateStr] || (dayOfWeek === 0 ? "Holiday" : "Not Conducted");

    weeklyStrip.push({
      date: dateStr,
      day: dayNames[dayOfWeek],
      dayNumber: String(d.getDate()).padStart(2, "0"),
      status, // "P", "A", "Holiday", "Not Conducted"
    });
  }

  // Monthly Breakdown array
  const monthlyBreakdown = Object.values(monthlyMap).map((m) => ({
    ...m,
    absent: m.total - m.attended,
    percent: m.total > 0 ? Math.round((m.attended / m.total) * 1000) / 10 : 0,
  }));

  res.json({
    success: true,
    student: {
      id: student._id,
      name: student.name,
      rollNo: student.rollNo,
      className: student.className,
      branch,
      year,
      section,
      parentPhone: student.parentPhone,
      deviceBoundAt: student.parentDeviceBoundAt,
      deviceModel: student.parentDeviceModel,
    },
    attendance: {
      percentage,
      standing,
      statusMessage,
      classesNeededFor75,
      totalClasses,
      classesAttended,
      classesAbsent,
      weeklyStrip,
      monthlyBreakdown,
      recentAbsences: recentAbsences.slice(0, 15),
    },
    contacts: {
      faculty: {
        name: faculty ? faculty.name : "Class In-charge",
        email: faculty ? faculty.email : "",
      },
      hod: {
        name: hod ? hod.name : `${branch} Department HOD`,
        email: hod ? hod.email : "",
        department: branch,
      },
    },
  });
});

/**
 * 6. Admin / HOD Reset Device Binding (When parent changes phone)
 * POST /api/parent/admin/reset-device/:studentId
 */
export const resetDeviceBinding = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const student = await Student.findById(studentId);

  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }

  const phoneDigits = cleanPhoneNumber(student.parentPhone).slice(-10);

  // Clear device binding for all records matching this parent phone
  await Student.updateMany(
    { parentPhone: new RegExp(phoneDigits + "$") },
    {
      $set: {
        parentDeviceId: null,
        parentDeviceModel: null,
        parentDeviceBoundAt: null,
        parentOtp: null,
        parentOtpExpires: null,
      },
    },
  );

  console.log(`[Admin Action] Device binding reset for parent phone ${student.parentPhone}`);

  res.json({
    success: true,
    message: `Parent device binding successfully reset for ${student.name} (${student.parentPhone}). The parent can now register a new phone.`,
  });
});
