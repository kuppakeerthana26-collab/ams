import mongoose from "mongoose";
import dotenv from "dotenv";
import Student from "../src/models/Student.js";
import Teacher from "../src/models/Teacher.js";
import AttendanceSubmission from "../src/models/AttendanceSubmission.js";

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const students = await Student.find({ className: "CSE_1_B" }).sort({ rollNo: 1 });
  const teacher = await Teacher.findOne({ "assignedClass.branch": "CSE", "assignedClass.year": 1, "assignedClass.section": "B" });
  const submissions = await AttendanceSubmission.find({ className: "CSE_1_B" });

  console.log("Teacher assigned:", teacher ? `${teacher.name} (${teacher.email})` : "None");
  console.log("Total students in CSE_1_B:", students.length);
  console.log("Total daily submissions for CSE_1_B:", submissions.length);
  console.log("\nAll 30 Students in CSE 1 B:");
  students.forEach((s, idx) => {
    console.log(`  ${String(idx + 1).padStart(2, "0")}. Roll: ${s.rollNo} | Name: ${s.name.padEnd(20)} | Parent Phone: ${s.parentPhone}`);
  });

  process.exit(0);
}

check();
