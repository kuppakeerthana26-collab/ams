import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    rollNo: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true, index: true },
    parentPhone: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

studentSchema.index({ className: 1, rollNo: 1 }, { unique: true });

export default mongoose.model("Student", studentSchema);
