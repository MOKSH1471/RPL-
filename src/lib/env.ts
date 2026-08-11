import { z } from 'zod';

const envSchema = z.object({
  VITE_SUBMIT_WEBHOOK_URL: z.string().url().optional(),
});

const rawEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  console.warn('⚠️ Runtime env validation issue:', parsed.error.flatten().fieldErrors);
}

export const env = parsed.success ? parsed.data : { VITE_SUBMIT_WEBHOOK_URL: undefined };

