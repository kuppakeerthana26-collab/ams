import mongoose from "mongoose";
import NotificationLog from "../models/NotificationLog.js";
import { env } from "../config/env.js";
import { sendWhatsAppMessage } from "./whatsappService.js";

const nextRetry = () => new Date(Date.now() + 5 * 60 * 1000);

/**
 * Generates trilingual absence notice in English, Telugu, and Tamil
 */
export const buildTrilingualAbsenceMessage = ({ studentName, rollNo, className, date }) => {
  return [
    `🏛️ *Gokula Krishna College of Engineering (GKCE)*`,
    `📢 *Student Absence Alert / గైర్హాజరు సమాచారం / வருகை தராத அறிவிப்பு*`,
    ``,
    `🇬🇧 *English:*`,
    `Dear Parent, your ward *${studentName}* (Roll: ${rollNo}, Class: ${className}) was *ABSENT* on *${date}*. Please ensure regular attendance.`,
    ``,
    `🇮🇳 *తెలుగు (Telugu):*`,
    `గౌరవనీయులైన తల్లిదండ్రులకు, మీ బిడ్డ *${studentName}* (${rollNo}) తేదీ *${date}* న కాలేజీకి రాలేదు (గైర్హాజరు). దయచేసి క్రమం తప్పకుండా కాలేజీకి పంపగలరు.`,
    ``,
    `🇮🇳 *தமிழ் (Tamil):*`,
    `அன்பான பெற்றோரே, உங்கள் பிள்ளை *${studentName}* (${rollNo}) *${date}* அன்று கல்லூரிக்கு வரவில்லை (வருகை தரவில்லை). தயவுசெய்து வழக்கமான வருகையை உறுதிப்படுத்தவும்.`,
    ``,
    `📞 GKCE Helpline: +91 86232 43126 | Parent Portal: https://gkce-ams-parent.loca.lt`,
  ].join("\n");
};

export const createAndSendAbsenceNotifications = async ({ absentees, submission, date }) => {
  // If WhatsApp credentials are not configured, skip WhatsApp notification logging
  if (!env.META_WHATSAPP_TOKEN || !env.META_PHONE_NUMBER_ID) {
    return [];
  }

  const results = [];

  for (const student of absentees) {
    const message = buildTrilingualAbsenceMessage({
      studentName: student.name,
      rollNo: student.rollNo,
      className: student.className || submission.className || "Class",
      date,
    });

    try {
      const log = await NotificationLog.create({
        student: student._id,
        attendanceSubmission: submission._id,
        parentPhone: student.parentPhone,
        message,
      });

      results.push(await sendNotificationLog(log));
    } catch (err) {
      console.warn(`Could not create notification log for student ${student.name}:`, err.message);
    }
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

  try {
    await log.save();
  } catch (err) {
    console.warn("Failed to update notification log in database:", err.message);
  }
  return log;
};

export const retryPendingNotifications = async () => {
  // Only attempt if WhatsApp credentials are provided and MongoDB is connected
  if (!env.META_WHATSAPP_TOKEN || !env.META_PHONE_NUMBER_ID) {
    return 0;
  }

  if (mongoose.connection.readyState !== 1) {
    return 0;
  }

  try {
    const logs = await NotificationLog.find({
      status: "failed",
      attempts: { $lt: env.NOTIFICATION_RETRY_LIMIT },
      $or: [{ nextRetryAt: { $lte: new Date() } }, { nextRetryAt: { $exists: false } }],
    }).limit(25);

    for (const log of logs) {
      await sendNotificationLog(log);
    }

    return logs.length;
  } catch (err) {
    console.warn("Notification retry skipped due to DB connectivity:", err.message);
    return 0;
  }
};
