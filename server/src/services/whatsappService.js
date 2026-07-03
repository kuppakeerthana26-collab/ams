import { env } from "../config/env.js";

export const sendWhatsAppMessage = async ({ to, message }) => {
  if (!env.META_WHATSAPP_TOKEN || !env.META_PHONE_NUMBER_ID) {
    const error = new Error("Meta WhatsApp credentials are not configured");
    error.statusCode = 503;
    throw error;
  }

  const url = `https://graph.facebook.com/${env.META_WHATSAPP_API_VERSION}/${env.META_PHONE_NUMBER_ID}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.META_WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { preview_url: false, body: message },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.error?.message || "WhatsApp message failed");
    error.providerResponse = data;
    throw error;
  }

  return data.messages?.[0]?.id || "";
};
