import mongoose from "mongoose";
import dotenv from "dotenv";
import Student from "../src/models/Student.js";
import AttendanceSubmission from "../src/models/AttendanceSubmission.js";
import AuditLog from "../src/models/AuditLog.js";
import NotificationLog from "../src/models/NotificationLog.js";
import Teacher from "../src/models/Teacher.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendance-management";

async function clearAllData() {
  try {
    console.log("Connecting to MongoDB:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!\n");

    // 1. Delete all Student records
    const studentResult = await Student.deleteMany({});
    console.log(`[CLEARED] Students: Removed ${studentResult.deletedCount} student records.`);

    // 2. Delete all Attendance Submissions
    const attendanceResult = await AttendanceSubmission.deleteMany({});
    console.log(`[CLEARED] Attendance Submissions: Removed ${attendanceResult.deletedCount} daily register records.`);

    // 3. Delete Audit Logs
    const auditResult = await AuditLog.deleteMany({});
    console.log(`[CLEARED] Audit Logs: Removed ${auditResult.deletedCount} logs.`);

    // 4. Delete Notification Logs
    const notificationResult = await NotificationLog.deleteMany({});
    console.log(`[CLEARED] Notification Logs: Removed ${notificationResult.deletedCount} logs.`);

    // 5. Clean up temporary seeded class teachers (keep core leadership accounts: principal, dean, hod, admin)
    const teacherDeleteResult = await Teacher.deleteMany({
      email: { $in: ["faculty.cse1b@college.edu", "faculty.cse2a@college.edu", "cse.teacher1@college.edu", "ece.teacher1@college.edu"] }
    });
    console.log(`[CLEARED] Temporary Faculty Accounts: Removed ${teacherDeleteResult.deletedCount} accounts.`);

    // 6. Verify Remaining Database State
    const remainingStudents = await Student.countDocuments();
    const remainingSubmissions = await AttendanceSubmission.countDocuments();
    const remainingTeachers = await Teacher.countDocuments();

    console.log("\n================ VERIFICATION SUMMARY ================");
    console.log(`• Total Students in Database:       ${remainingStudents}`);
    console.log(`• Total Attendance Submissions:     ${remainingSubmissions}`);
    console.log(`• Active Admin/Leadership Accounts: ${remainingTeachers}`);
    console.log("======================================================");

    console.log("\nAll existing student and attendance data has been completely wiped!");
    process.exit(0);
  } catch (err) {
    console.error("Error clearing data:", err);
    process.exit(1);
  }
}

clearAllData();
