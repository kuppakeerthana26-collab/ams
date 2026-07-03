import bcrypt from "bcrypt";
import mongoose from "mongoose";

const hodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 8, select: false },
    department: { type: String, trim: true },
    role: { type: String, enum: ["hod"], default: "hod", index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

hodSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

hodSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("Hod", hodSchema);
