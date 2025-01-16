import { proto, WAMessage } from '@whiskeysockets/baileys';

export function getQuotedMessage({ message }: WAMessage): { quotedMessage: proto.IMessage; quotedAuthor: null | string | undefined } | undefined {
  const messageContextInfo = message?.extendedTextMessage?.contextInfo;
  if (!messageContextInfo) return undefined;
  const quotedMessage = messageContextInfo.quotedMessage;
  if (!quotedMessage) return undefined;
  return { quotedMessage, quotedAuthor: messageContextInfo.participant };
}
