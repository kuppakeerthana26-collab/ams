import mongoose from "mongoose";
import dotenv from "dotenv";
import Student from "../src/models/Student.js";
import AttendanceSubmission from "../src/models/AttendanceSubmission.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendance-management";

async function removeStudentsCse1A() {
  try {
    console.log("Connecting to MongoDB:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!");

    const className = "CSE_1_A";

    // 1. Delete all students in CSE_1_A
    const studentDeleteResult = await Student.deleteMany({ className });
    console.log(`Successfully removed ${studentDeleteResult.deletedCount} students from ${className}.`);

    // 2. Delete all attendance submissions for CSE_1_A
    const submissionDeleteResult = await AttendanceSubmission.deleteMany({ className });
    console.log(`Successfully deleted ${submissionDeleteResult.deletedCount} attendance submissions for ${className}.`);

    // 3. Verify counts
    const remainingStudents = await Student.countDocuments({ className });
    const remainingSubmissions = await AttendanceSubmission.countDocuments({ className });

    console.log(`Verification: Remaining students in ${className}: ${remainingStudents}`);
    console.log(`Verification: Remaining submissions for ${className}: ${remainingSubmissions}`);

    console.log("Operation completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error removing students from CSE_1_A:", err);
    process.exit(1);
  }
}

removeStudentsCse1A();
