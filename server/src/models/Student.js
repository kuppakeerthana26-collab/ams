import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    rollNo: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true, index: true },
    parentPhone: { type: String, required: true, trim: true, index: true },
    parentDeviceId: { type: String, default: null, trim: true },
    parentDeviceModel: { type: String, default: null, trim: true },
    parentDeviceBoundAt: { type: Date, default: null },
    parentOtp: { type: String, default: null },
    parentOtpExpires: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

studentSchema.index({ className: 1, rollNo: 1 }, { unique: true });

export default mongoose.model("Student", studentSchema);
