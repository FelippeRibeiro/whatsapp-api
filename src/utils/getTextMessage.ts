import { proto } from '@whiskeysockets/baileys';

export const getTextContent = (msg: proto.IWebMessageInfo): string | null => {
  return msg?.message?.conversation
    ? msg?.message?.conversation
    : msg?.message?.extendedTextMessage?.text
    ? msg?.message?.extendedTextMessage?.text
    : msg?.message?.imageMessage?.caption
    ? msg?.message?.imageMessage?.caption
    : msg?.message?.videoMessage?.caption
    ? msg?.message?.videoMessage?.caption
    : msg?.message?.documentMessage?.caption
    ? msg?.message?.documentMessage?.caption
    : null;
};
