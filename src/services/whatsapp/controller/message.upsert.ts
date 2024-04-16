import { MessageUpsertType, proto } from '@whiskeysockets/baileys';
import { getMessageType } from '../utils/getMessageType';
import { getMessageBody } from '../utils/getBodyMessage';
import { Whatsapp, WhatsappClient } from '../whatsapp';

export class MessageUpsertController {
  constructor(private instance: Whatsapp) {}

  async handleEvent(messagesUpsert: { messages: proto.IWebMessageInfo[]; type: MessageUpsertType }) {
    const messageData = messagesUpsert.messages[0];
    const messageProps = messageData.message;
    const messageType = getMessageType(messageData);
    const messageBody = getMessageBody(messageData);

    const author = messageData.key.participant ?? messageData.key.remoteJid;
    const chatJid = messageData.key.remoteJid;

    if (!author || !messageProps || !messageBody || !messageType || !chatJid || messageData.key.fromMe || chatJid === 'status@broadcast') return;

    if (messageBody.startsWith('/')) {
      const [commandQuery, ...args] = messageBody.replace('/', '').split(' ');
      const command = this.instance.commands.find((cmd) => cmd.name === commandQuery || cmd.aliases?.includes(commandQuery));
      if (command) command.execute(messageData);
    }
    return;
  }
}
