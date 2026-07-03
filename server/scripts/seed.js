import mongoose from "mongoose";
import { env } from "../src/config/env.js";
import connectDb from "../src/config/database.js";
import Hod from "../src/models/Hod.js";
import Teacher from "../src/models/Teacher.js";

const seedUsers = async () => {
  if (!env.SEED_ADMIN_EMAIL || !env.SEED_ADMIN_PASSWORD) {
    throw new Error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD before running the seed script");
  }

  await connectDb();

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

  if (env.SEED_HOD_EMAIL && env.SEED_HOD_PASSWORD) {
    const existingHod = await Hod.findOne({ email: env.SEED_HOD_EMAIL }).select("_id email role");

    if (existingHod) {
      console.log(`HOD already exists: ${existingHod.email}`);
      return;
    }

    await Hod.create({
      name: env.SEED_HOD_NAME,
      email: env.SEED_HOD_EMAIL,
      password: env.SEED_HOD_PASSWORD,
      department: env.SEED_HOD_DEPARTMENT,
      isActive: true,
    });

    console.log(`HOD created: ${env.SEED_HOD_EMAIL}`);
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
