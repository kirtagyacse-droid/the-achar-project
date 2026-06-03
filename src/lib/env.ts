import { z } from 'zod';

const whatsappSchema = z.object({
  AUNTY_WHATSAPP_NUMBER: z.string().regex(/^\d+$/, "Aunty's WhatsApp number must be digits only with country code (e.g. 919876543210)"),
  CALLMEBOT_API_KEY: z.string().min(1, "CallMeBot API key is required"),
});

const coreSchema = z.object({
  CRON_SECRET: z.string().min(1, "CRON_SECRET is required"),
  NEXT_PUBLIC_SITE_URL: z.string().url("NEXT_PUBLIC_SITE_URL must be a valid URL"),
});

const allEnv = {
  AUNTY_WHATSAPP_NUMBER: process.env.AUNTY_WHATSAPP_NUMBER,
  CALLMEBOT_API_KEY: process.env.CALLMEBOT_API_KEY,
  CRON_SECRET: process.env.CRON_SECRET,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
};

// Validate core variables
const coreResult = coreSchema.safeParse(allEnv);
if (!coreResult.success) {
  console.warn(
    "⚠️ [Env Warning] Missing or invalid core environment variables:\n",
    JSON.stringify(coreResult.error.format(), null, 2)
  );
}

// Validate WhatsApp variables (warn, do not throw)
const whatsappResult = whatsappSchema.safeParse(allEnv);
if (!whatsappResult.success) {
  console.warn(
    "⚠️ [WhatsApp Config Warning] WhatsApp alerts are disabled because AUNTY_WHATSAPP_NUMBER or CALLMEBOT_API_KEY is missing or invalid:\n",
    JSON.stringify(whatsappResult.error.format(), null, 2)
  );
}

export const env = {
  AUNTY_WHATSAPP_NUMBER: process.env.AUNTY_WHATSAPP_NUMBER || "",
  CALLMEBOT_API_KEY: process.env.CALLMEBOT_API_KEY || "",
  CRON_SECRET: process.env.CRON_SECRET || "",
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  isWhatsAppConfigured: whatsappResult.success,
};
