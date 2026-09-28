import mongoose from "mongoose";
import dotenv from "dotenv";
import Student from "../src/models/Student.js";
import Teacher from "../src/models/Teacher.js";
import AttendanceSubmission from "../src/models/AttendanceSubmission.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendance-management";

const studentNames = [
  "A. Sai Teja",
  "B. Anusha",
  "C. Vignesh Reddy",
  "D. Keerthi",
  "E. Manoj Kumar",
  "G. Harshitha",
  "H. Praveen",
  "J. Deepthi",
  "K. Sai Praneeth",
  "K. Likitha",
  "L. Rohith",
  "M. Divya Sri",
  "M. Tarun",
  "N. Sowmya",
  "P. Hemanth Kumar",
  "P. Lavanya",
  "R. Sandeep",
  "R. Navyasree",
  "S. Vamsi Krishna",
  "S. Sushmitha",
  "T. Rajesh",
  "T. Mounika",
  "V. Harshavardhan",
  "V. Sneha",
  "Y. Charan",
  "Y. Poojitha",
  "B. Rakesh",
  "K. Akhila",
  "M. Jaswanth",
  "P. Tejaswini"
];

async function seedCse1B() {
  try {
    console.log("Connecting to MongoDB:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!");

    const className = "CSE_1_B";

    // 1. Create or Find Faculty for CSE_1_B
    let teacher = await Teacher.findOne({ email: "faculty.cse1b@college.edu" });
    if (!teacher) {
      teacher = await Teacher.findOne({ "assignedClass.branch": "CSE", "assignedClass.year": 1, "assignedClass.section": "B" });
    }
    if (!teacher) {
      teacher = new Teacher({
        name: "Mrs. M. Radhika",
        email: "faculty.cse1b@college.edu",
        password: "TeacherPass123!",
        role: "teacher",
        department: "CSE",
        assignedClass: {
          branch: "CSE",
          year: 1,
          section: "B",
        },
        isActive: true,
      });
      await teacher.save();
      console.log("Created Faculty in-charge for CSE_1_B: Mrs. M. Radhika");
    } else {
      console.log("Found existing Teacher for CSE_1_B:", teacher.name);
    }

    // 2. Remove existing CSE_1_B students to have a clean 30 student set
    const deletedCount = await Student.deleteMany({ className });
    console.log(`Cleared ${deletedCount.deletedCount} old students from ${className}`);

    // 3. Create 30 Students
    const studentDocs = [];
    for (let i = 0; i < studentNames.length; i++) {
      const rollSuffix = String(61 + i).padStart(2, "0"); // 24F81A0561 to 24F81A0590
      const rollNo = `24F81A05${rollSuffix}`;
      const name = studentNames[i];
      const phoneRandom = String(9440100000 + (i * 137)).slice(0, 10);
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

    // 4. Generate Past 14 Days Attendance Submissions
    const dates = [];
    for (let d = 13; d >= 0; d--) {
      const dt = new Date();
      dt.setDate(dt.getDate() - d);
      dates.push(dt.toISOString().slice(0, 10));
    }

    // Clear old submissions for this class
    await AttendanceSubmission.deleteMany({ className });

    for (let i = 0; i < dates.length; i++) {
      const dateStr = dates[i];
      const dObj = new Date(dateStr);
      const day = dObj.getDate();
      const month = dObj.getMonth() + 1;
      const year = dObj.getFullYear();

      // Determine attendance entries for each student
      const entries = createdStudents.map((st, sIdx) => {
        // High attendance probability (~85%), but student 28 and 29 have lower attendance
        let isPresent = Math.random() < 0.86;
        if (sIdx === 28) isPresent = Math.random() < 0.45; // Critical defaulter (<50%)
        if (sIdx === 29) isPresent = Math.random() < 0.65; // Warning defaulter (~65%)

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
        sheetTitle: `CSE 1st Year Sec-B (${dateStr})`,
        entries,
      });

      await submission.save();
    }

    console.log(`Created ${dates.length} daily attendance registers for ${className}!`);
    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding CSE_1_B:", err);
    process.exit(1);
  }
}

seedCse1B();
