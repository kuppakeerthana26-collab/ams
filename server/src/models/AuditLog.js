import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    action: { type: String, required: true, index: true },
    entity: { type: String, required: true },
    entityId: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

export default mongoose.model("AuditLog", auditLogSchema);
