import { getMessageType } from '../utils/getMessageType';
import { getMessageBody } from '../utils/getBodyMessage';
import { Whatsapp } from '../whatsapp';
import { IMessageUpsertEventPayload } from '../interfaces/message.upsert.interface';
import { IHandleMessage } from '../interfaces/message.handler.interface';
import { logger } from '../../../lib/logger';
import { MessageCollector } from '../utils/messageCollector2';

export class MessageUpsertController {
  constructor(private instance: Whatsapp) {}

  async handleEvent(messagesUpsert: IMessageUpsertEventPayload) {
    const messageData = messagesUpsert.messages[0];
    if (!messageData.message) return; // Early return if the message has no message core
    if (messageData.key.fromMe) return; // Early return if the message is from the bot
    const chatJid = messageData.key.remoteJid;
    const isGroup = chatJid?.includes('@g.us');
    if (!chatJid || chatJid === 'status@broadcast') return; // Early return if the message is from a broadcast status
    if (isGroup) return; // Early return if the message is from a group

    const messageType = getMessageType(messageData);
    const author = messageData.key.participant ?? messageData.key.remoteJid;
    if (!author || !messageType) return; // Early return if the message has no author, props or type bellow this line

    const messageProps = messageData.message;
    const messageBody = getMessageBody(messageProps);
    // if (!messageBody) return; // Early return if the message has no text content, just media. validate by you own
    const authorNumber = author!.split('@')[0];

    logger.info(`${authorNumber} : (${messageType}) => ${messageBody}`);

    if (MessageCollector.messageCollectorMap.size) {
      if (MessageCollector.messageCollectorMap.has(author)) {
        const collector = MessageCollector.messageCollectorMap.get(author);
        collector!({ author, messageBody, messageData, messageProps, messageType });
        MessageCollector.messageCollectorMap.delete(author);
        return;
      }
    }

    return this.handleMessage({ messageData, author, messageBody, messageProps, messageType });
  }

  private async handleMessage({ messageData, author, messageBody, messageProps, messageType }: IHandleMessage): Promise<void> {
    if (messageBody.startsWith('/')) {
      const [commandQuery, ...args] = messageBody.replace('/', '').split(' ');
      const command = this.instance.commands.find((cmd) => cmd.name === commandQuery || cmd.aliases?.includes(commandQuery));
      if (command) return command.execute({ author, messageBody, messageData, messageProps, messageType }, args);
    }
  }
}
