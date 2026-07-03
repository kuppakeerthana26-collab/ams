import mongoose from "mongoose";

const notificationLogSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    attendanceSubmission: { type: mongoose.Schema.Types.ObjectId, ref: "AttendanceSubmission", required: true },
    parentPhone: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["pending", "sent", "failed"], default: "pending", index: true },
    attempts: { type: Number, default: 0 },
    lastError: { type: String, default: "" },
    providerMessageId: { type: String, default: "" },
    nextRetryAt: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model("NotificationLog", notificationLogSchema);
