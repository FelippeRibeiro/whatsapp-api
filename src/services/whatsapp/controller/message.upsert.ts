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

    const author = messageData.key.participant ?? messageData.key.remoteJid;
    const chatJid = messageData.key.remoteJid;

    if (!author || !messageProps || !messageType || !chatJid || messageData.key.fromMe || chatJid === 'status@broadcast') return;

    console.log({ author, messageBody, messageType });
    return;
  }
}
