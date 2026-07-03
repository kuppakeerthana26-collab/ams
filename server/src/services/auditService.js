import AuditLog from "../models/AuditLog.js";

export const logAudit = async ({ actor, action, entity, entityId, metadata = {} }) => {
  await AuditLog.create({
    actor,
    action,
    entity,
    entityId,
    metadata,
  });
};
