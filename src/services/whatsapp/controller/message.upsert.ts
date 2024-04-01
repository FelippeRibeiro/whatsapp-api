import makeWASocket, { MessageUpsertType, proto } from '@whiskeysockets/baileys';
import { getTextContent } from '../utils/getTextMessage';
import { getMessageType } from '../utils/getMessageType';
import { MessageCollector } from '../utils/messageCollector';

export async function messageUpserts(
  update: { messages: proto.IWebMessageInfo[]; type: MessageUpsertType },
  client: ReturnType<typeof makeWASocket>
) {
  const msg: proto.IWebMessageInfo = update.messages[0];
  if (!msg.message) return;
  if (msg.key.fromMe) return;
  if (msg.key.remoteJid === 'status@broadcast' || msg.key.remoteJid!.endsWith('@g.us')) return;
  const messageType = getMessageType(msg);
  const from: string = String(msg.key.remoteJid);
  return;
}
