import mongoose from "mongoose";
import { env } from "../src/config/env.js";
import connectDb from "../src/config/database.js";
import Hod from "../src/models/Hod.js";
import Teacher from "../src/models/Teacher.js";
import Student from "../src/models/Student.js";

const seedUsers = async () => {
  await connectDb();

  // 1. Seed Admin
  if (env.SEED_ADMIN_EMAIL && env.SEED_ADMIN_PASSWORD) {
    const existingAdmin = await Teacher.findOne({ email: env.SEED_ADMIN_EMAIL });
    if (!existingAdmin) {
      await Teacher.create({
        name: env.SEED_ADMIN_NAME || "System Administrator",
        email: env.SEED_ADMIN_EMAIL,
        password: env.SEED_ADMIN_PASSWORD,
        role: "admin",
        isActive: true,
      });
      console.log(`Admin created: ${env.SEED_ADMIN_EMAIL}`);
    }
  }

  // 2. Seed Dean
  const deanEmail = "dean@college.edu";
  const existingDean = await Teacher.findOne({ email: deanEmail });
  if (!existingDean) {
    await Teacher.create({
      name: "Dr. K. Sarojini (Dean Academics)",
      email: deanEmail,
      password: "DeanPass123!",
      role: "dean",
      department: "ALL",
      isActive: true,
    });
    console.log(`Dean created: ${deanEmail}`);
  } else {
    existingDean.role = "dean";
    await existingDean.save();
  }

  // 3. Seed Principal
  const principalEmail = "principal@college.edu";
  const existingPrincipal = await Teacher.findOne({ email: principalEmail });
  if (!existingPrincipal) {
    await Teacher.create({
      name: "Dr. V. Ravindra (Principal)",
      email: principalEmail,
      password: "PrincipalPass123!",
      role: "principal",
      department: "ALL",
      isActive: true,
    });
    console.log(`Principal created: ${principalEmail}`);
  } else {
    existingPrincipal.role = "principal";
    await existingPrincipal.save();
  }

  // 4. Seed HODs (CSE & ECE)
  const hodAccounts = [
    { name: "Dr. K. Ramesh (HOD CSE)", email: "hod.cse@college.edu", password: "HodPass123!", department: "CSE" },
    { name: "Dr. M. Sreenivasulu (HOD ECE)", email: "hod.ece@college.edu", password: "HodPass123!", department: "ECE" },
  ];

  for (const h of hodAccounts) {
    const exists = await Hod.findOne({ email: h.email });
    if (!exists) {
      await Hod.create({ ...h, isActive: true });
      console.log(`HOD created: ${h.email}`);
    }
  }

  // 5. Seed Teachers
  const teacherAccounts = [
    {
      name: "Prof. Ananya Rao",
      email: "cse.teacher1@college.edu",
      password: "TeacherPass123!",
      role: "teacher",
      assignedClass: { branch: "CSE", year: 1, section: "A" },
    },
    {
      name: "Prof. Rajesh Kumar",
      email: "ece.teacher1@college.edu",
      password: "TeacherPass123!",
      role: "teacher",
      assignedClass: { branch: "ECE", year: 2, section: "A" },
    },
  ];

  for (const t of teacherAccounts) {
    const exists = await Teacher.findOne({ email: t.email });
    if (!exists) {
      await Teacher.create({ ...t, isActive: true });
      console.log(`Teacher created: ${t.email}`);
    }
  }

  // 6. Seed Students (CSE & ECE)
  const sampleStudents = [
    { rollNo: "101", name: "Aarav Sharma", className: "CSE_1_A", parentPhone: "+919876543210" },
    { rollNo: "102", name: "Ananya Patel", className: "CSE_1_A", parentPhone: "+919876543211" },
    { rollNo: "103", name: "Rohan Verma", className: "CSE_1_A", parentPhone: "+919876543212" },
    { rollNo: "104", name: "Diya Reddy", className: "CSE_1_A", parentPhone: "+919876543213" },
    { rollNo: "105", name: "Sai Krishna", className: "CSE_1_A", parentPhone: "+919876543214" },
    { rollNo: "201", name: "Bhavya Sri", className: "ECE_2_A", parentPhone: "+919876543221" },
    { rollNo: "202", name: "Chaitanya Teja", className: "ECE_2_A", parentPhone: "+919876543222" },
    { rollNo: "203", name: "Dinesh Kumar", className: "ECE_2_A", parentPhone: "+919876543223" },
  ];

  for (const st of sampleStudents) {
    const exists = await Student.findOne({ className: st.className, rollNo: st.rollNo });
    if (!exists) {
      await Student.create(st);
      console.log(`Enrolled student: ${st.rollNo} - ${st.name} in ${st.className}`);
    }
  }

  console.log("Database seeded successfully with Dean, Principal, HODs, Teachers, and Students!");
};

seedUsers()
  .catch((error) => {
    console.error("Seed error:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
