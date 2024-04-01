import makeWASocket, { MessageUpsertType, proto } from '@whiskeysockets/baileys';
import { getTextContent } from '../utils/getTextMessage';

export async function messageUpserts(
  update: { messages: proto.IWebMessageInfo[]; type: MessageUpsertType },
  client: ReturnType<typeof makeWASocket>
) {
  const msg: proto.IWebMessageInfo = update.messages[0];
  if (!msg.message) return;
  if (msg.key.fromMe) return;
  if (msg.key.remoteJid === 'status@broadcast' || msg.key.remoteJid!.endsWith('@g.us')) return;
  const messageType = Object.keys(msg.message)[0];
  const from: string = String(msg.key.remoteJid);
  console.log(getTextContent(msg));
  return;
}
