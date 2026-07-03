import NotificationLog from "../models/NotificationLog.js";
import { env } from "../config/env.js";
import { sendWhatsAppMessage } from "./whatsappService.js";

const nextRetry = () => new Date(Date.now() + 5 * 60 * 1000);

export const createAndSendAbsenceNotifications = async ({ absentees, submission, date }) => {
  const results = [];

  for (const student of absentees) {
    const message = `Dear Parent, your child ${student.name} was absent on ${date}.`;
    const log = await NotificationLog.create({
      student: student._id,
      attendanceSubmission: submission._id,
      parentPhone: student.parentPhone,
      message,
    });

    results.push(await sendNotificationLog(log));
  }

  return results;
};

export const sendNotificationLog = async (log) => {
  try {
    const providerMessageId = await sendWhatsAppMessage({
      to: log.parentPhone,
      message: log.message,
    });

    log.status = "sent";
    log.providerMessageId = providerMessageId;
    log.attempts += 1;
    log.lastError = "";
  } catch (error) {
    log.status = "failed";
    log.attempts += 1;
    log.lastError = error.message;
    log.nextRetryAt = log.attempts < env.NOTIFICATION_RETRY_LIMIT ? nextRetry() : undefined;
  }

  await log.save();
  return log;
};

export const retryPendingNotifications = async () => {
  const logs = await NotificationLog.find({
    status: "failed",
    attempts: { $lt: env.NOTIFICATION_RETRY_LIMIT },
    $or: [{ nextRetryAt: { $lte: new Date() } }, { nextRetryAt: { $exists: false } }],
  }).limit(25);

  for (const log of logs) {
    await sendNotificationLog(log);
  }

  return logs.length;
};
