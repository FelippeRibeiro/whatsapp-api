import { z } from 'zod';

export const ZSendMessageBody = z.object({
  remoteJid: z.string().array(),
  text: z.string().min(1),
});

export type SendMessageBody = z.infer<typeof ZSendMessageBody>;
