import { MessageUpsertType, proto } from '@whiskeysockets/baileys';
import { getMessageType } from '../utils/getMessageType';
import { getMessageBody } from '../utils/getBodyMessage';
import { WhatsappClient } from '../whatsapp';

export class MessageUpsertController {
  constructor(private instance: WhatsappClient) {}

  async handleEvent(messagesUpsert: { messages: proto.IWebMessageInfo[]; type: MessageUpsertType }) {
    const messageData = messagesUpsert.messages[0];
    const messageProps = messageData.message;
    const messageBody = getMessageBody(messageData);
    const messageType = getMessageType(messageData);

    if (!messageProps) return;
    if (messageData.key.fromMe) return;
    if (messageData.key.remoteJid === 'status@broadcast' || messageData.key.remoteJid!.endsWith('@g.us')) return;

    const from = messageData.key.participant ?? messageData.key.remoteJid;
    if (!from || !messageProps || !messageType) return;
    console.log({ messageBody, messageType });
    return;
  }
}
