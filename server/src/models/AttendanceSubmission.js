import mongoose from "mongoose";

const attendanceEntrySchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    rollNo: { type: String, required: true },
    name: { type: String, required: true },
    status: { type: String, enum: ["P", "A"], required: true },
  },
  { _id: false },
);

const attendanceSubmissionSchema = new mongoose.Schema(
  {
    className: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    day: { type: Number, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    sheetTitle: { type: String, required: true },
    entries: [attendanceEntrySchema],
  },
  { timestamps: true },
);

attendanceSubmissionSchema.index({ className: 1, date: 1 }, { unique: true });

export default mongoose.model("AttendanceSubmission", attendanceSubmissionSchema);
