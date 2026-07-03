import bcrypt from "bcrypt";
import mongoose from "mongoose";

const assignedClassSchema = new mongoose.Schema(
  {
    branch: { type: String, trim: true },
    year: { type: Number, min: 1 },
    section: { type: String, trim: true },
  },
  { _id: false },
);

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["teacher", "admin"], default: "teacher", index: true },
    assignedClass: assignedClassSchema,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

teacherSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

teacherSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("Teacher", teacherSchema);
