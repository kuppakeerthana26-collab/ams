import mongoose from "mongoose";
import dotenv from "dotenv";
import AttendanceSubmission from "../src/models/AttendanceSubmission.js";
import Student from "../src/models/Student.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendance-management";

async function clearAttendanceForCse1B() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const result = await AttendanceSubmission.deleteMany({ className: "CSE_1_B" });
    console.log(`Deleted ${result.deletedCount} attendance submission records for CSE_1_B.`);

    const students = await Student.find({ className: "CSE_1_B" });
    console.log(`Remaining enrolled students in CSE_1_B: ${students.length}`);

    process.exit(0);
  } catch (err) {
    console.error("Error deleting attendance for CSE_1_B:", err);
    process.exit(1);
  }
}

clearAttendanceForCse1B();
