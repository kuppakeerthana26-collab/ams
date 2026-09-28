import mongoose from "mongoose";
import dotenv from "dotenv";
import Student from "../src/models/Student.js";
import Teacher from "../src/models/Teacher.js";
import AttendanceSubmission from "../src/models/AttendanceSubmission.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendance-management";

const studentNames = [
  "A. Bharath Kumar",
  "B. Chandana Priya",
  "C. Dinesh Reddy",
  "D. Eswar Prasad",
  "G. Gayatri Devi",
  "H. Harish Babu",
  "J. Indu Madhavi",
  "K. Kalyan Chakravarthy",
  "K. Lavanya",
  "M. Mahesh",
  "M. Niharika",
  "N. Naveen Kumar",
  "P. Pawan Kalyan",
  "P. Pranathi",
  "R. Rahul Varma",
  "R. Rithika",
  "S. Sai Charan",
  "S. Shravani",
  "T. Tarun Teja",
  "T. Thanuja",
  "V. Varun Kumar",
  "V. Vennela",
  "Y. Yashwanth",
  "Y. Yamini",
  "B. Sai Pranav",
  "K. Geethika",
  "M. Avinash",
  "P. Sai Krishna",
  "R. Meghana",
  "S. Jagadeesh"
];

async function seedCse2A() {
  try {
    console.log("Connecting to MongoDB:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!");

    const className = "CSE_2_A";

    // 1. Create or Find Faculty in-charge for CSE_2_A
    let teacher = await Teacher.findOne({ email: "faculty.cse2a@college.edu" });
    if (!teacher) {
      teacher = await Teacher.findOne({
        "assignedClass.branch": "CSE",
        "assignedClass.year": 2,
        "assignedClass.section": "A",
      });
    }

    if (!teacher) {
      teacher = new Teacher({
        name: "Dr. P. Suresh Kumar",
        email: "faculty.cse2a@college.edu",
        password: "TeacherPass123!",
        role: "teacher",
        department: "CSE",
        assignedClass: {
          branch: "CSE",
          year: 2,
          section: "A",
        },
        isActive: true,
      });
      await teacher.save();
      console.log("Created Faculty in-charge for CSE_2_A: Dr. P. Suresh Kumar");
    } else {
      console.log("Found existing Teacher for CSE_2_A:", teacher.name);
    }

    // 2. Clear existing students for CSE_2_A to ensure a clean set of 30
    const deletedStudents = await Student.deleteMany({ className });
    console.log(`Cleared ${deletedStudents.deletedCount} old students from ${className}`);

    // 3. Create 30 Students (Roll: 23F81A0501 to 23F81A0530)
    const studentDocs = [];
    for (let i = 0; i < studentNames.length; i++) {
      const rollSuffix = String(i + 1).padStart(2, "0");
      const rollNo = `23F81A05${rollSuffix}`;
      const name = studentNames[i];
      const phoneRandom = String(9848000000 + ((i + 1) * 239)).slice(0, 10);
      const parentPhone = `+91${phoneRandom}`;

      const student = new Student({
        rollNo,
        name,
        className,
        parentPhone,
        parentPassword: "Parent@123",
        isActive: true,
      });
      studentDocs.push(student);
    }

    const createdStudents = await Student.insertMany(studentDocs);
    console.log(`Successfully created ${createdStudents.length} fake students in ${className}!`);

    // 4. Generate Past 30 Days of Attendance Submissions
    const dates = [];
    for (let d = 29; d >= 0; d--) {
      const dt = new Date();
      dt.setDate(dt.getDate() - d);
      dates.push(dt.toISOString().slice(0, 10));
    }

    // Clear old submissions for this class
    const deletedSubmissions = await AttendanceSubmission.deleteMany({ className });
    console.log(`Cleared ${deletedSubmissions.deletedCount} old submissions for ${className}`);

    for (let i = 0; i < dates.length; i++) {
      const dateStr = dates[i];
      const dObj = new Date(dateStr);
      const day = dObj.getDate();
      const month = dObj.getMonth() + 1;
      const year = dObj.getFullYear();

      // Determine attendance entries for each student
      const entries = createdStudents.map((st, sIdx) => {
        // High regular attendance (~88% average)
        let isPresent = Math.random() < 0.88;
        // Student 27 (sIdx 26) - Critical Defaulter (~48% attendance)
        if (sIdx === 26) isPresent = Math.random() < 0.48;
        // Student 28 (sIdx 27) - Warning Defaulter (~62% attendance)
        if (sIdx === 27) isPresent = Math.random() < 0.62;
        // Student 29 (sIdx 28) - Irregular attendance (~68%)
        if (sIdx === 28) isPresent = Math.random() < 0.68;
        // Student 1 (sIdx 0) & Student 2 (sIdx 1) - High achievers (~98%)
        if (sIdx <= 1) isPresent = Math.random() < 0.98;

        return {
          student: st._id,
          rollNo: st.rollNo,
          name: st.name,
          status: isPresent ? "P" : "A",
        };
      });

      const submission = new AttendanceSubmission({
        className,
        date: dateStr,
        month,
        year,
        day,
        teacher: teacher._id,
        sheetTitle: `CSE 2nd Year Sec-A (${dateStr})`,
        entries,
      });

      await submission.save();
    }

    console.log(`Successfully generated ${dates.length} daily attendance registers (30 days) for ${className}!`);
    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding CSE_2_A:", err);
    process.exit(1);
  }
}

seedCse2A();
