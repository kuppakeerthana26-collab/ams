import mongoose from "mongoose";
import { env } from "../src/config/env.js";
import connectDb from "../src/config/database.js";
import Hod from "../src/models/Hod.js";
import Teacher from "../src/models/Teacher.js";
import Student from "../src/models/Student.js";

const seedUsers = async () => {
  if (!env.SEED_ADMIN_EMAIL || !env.SEED_ADMIN_PASSWORD) {
    throw new Error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD before running the seed script");
  }

  await connectDb();

  // 1. Seed Admin
  const existingAdmin = await Teacher.findOne({ email: env.SEED_ADMIN_EMAIL }).select("_id email role");
  if (existingAdmin) {
    console.log(`Admin already exists: ${existingAdmin.email}`);
  } else {
    await Teacher.create({
      name: env.SEED_ADMIN_NAME,
      email: env.SEED_ADMIN_EMAIL,
      password: env.SEED_ADMIN_PASSWORD,
      role: "admin",
      isActive: true,
    });
    console.log(`Admin created: ${env.SEED_ADMIN_EMAIL}`);
  }

  // 2. Seed HOD
  if (env.SEED_HOD_EMAIL && env.SEED_HOD_PASSWORD) {
    const existingHod = await Hod.findOne({ email: env.SEED_HOD_EMAIL }).select("_id email role");
    if (existingHod) {
      console.log(`HOD already exists: ${existingHod.email}`);
    } else {
      await Hod.create({
        name: env.SEED_HOD_NAME,
        email: env.SEED_HOD_EMAIL,
        password: env.SEED_HOD_PASSWORD,
        department: env.SEED_HOD_DEPARTMENT || "CSE",
        isActive: true,
      });
      console.log(`HOD created: ${env.SEED_HOD_EMAIL}`);
    }
  }

  // 3. Seed Faculty Teacher
  const teacherEmail = "cse.teacher1@college.edu";
  const existingTeacher = await Teacher.findOne({ email: teacherEmail }).select("_id email");
  if (existingTeacher) {
    console.log(`Teacher already exists: ${existingTeacher.email}`);
  } else {
    await Teacher.create({
      name: "Prof. Rajesh Sharma",
      email: teacherEmail,
      password: "TeacherPass123!",
      role: "teacher",
      assignedClass: {
        branch: "CSE",
        year: 1,
        section: "A",
      },
      isActive: true,
    });
    console.log(`Teacher created: ${teacherEmail}`);
  }

  // 4. Seed Sample Students for CSE_1_A
  const sampleStudents = [
    { rollNo: "101", name: "Aarav Sharma", className: "CSE_1_A", parentPhone: "+919876543210" },
    { rollNo: "102", name: "Ananya Patel", className: "CSE_1_A", parentPhone: "+919876543211" },
    { rollNo: "103", name: "Rohan Verma", className: "CSE_1_A", parentPhone: "+919876543212" },
    { rollNo: "104", name: "Diya Reddy", className: "CSE_1_A", parentPhone: "+919876543213" },
    { rollNo: "105", name: "Sai Krishna", className: "CSE_1_A", parentPhone: "+919876543214" },
  ];

  for (const st of sampleStudents) {
    const exists = await Student.findOne({ className: st.className, rollNo: st.rollNo });
    if (!exists) {
      await Student.create(st);
      console.log(`Enrolled student: ${st.rollNo} - ${st.name} in ${st.className}`);
    }
  }
};

seedUsers()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
