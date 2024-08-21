import { getMessageType } from '../utils/getMessageType';
import { getMessageBody } from '../utils/getBodyMessage';
import { Whatsapp } from '../whatsapp';
import { IMessageUpsertEventPayload } from '../interfaces/message.upsert.interface';
import { IHandleMessage } from '../interfaces/message.handler.interface';
import { logger } from '../../../lib/logger';
export class MessageUpsertController {
  constructor(private instance: Whatsapp) {}

  async handleEvent(messagesUpsert: IMessageUpsertEventPayload) {
    const messageData = messagesUpsert.messages[0];
    if (!messageData.message) return; // Early return if the message has no message core
    if (messageData.key.fromMe) return; // Early return if the message is from the bot
    const chatJid = messageData.key.remoteJid;
    if (!chatJid || chatJid === 'status@broadcast') return; // Early return if the message is from a broadcast status

    const messageType = getMessageType(messageData);
    const author = messageData.key.participant ?? messageData.key.remoteJid;
    if (!author || !messageType) return; // Early return if the message has no author, props or type bellow this line

    const messageProps = messageData.message;
    const messageBody = getMessageBody(messageProps);
    // if (!messageBody) return; // Early return if the message has no text content, just media. validate by you own
    const authorNumber = author!.split('@')[0];

    logger.info(`${authorNumber} : (${messageType}) => ${messageBody}`);
    return this.handleMessage({ messageData, author, messageBody, messageProps, messageType });
  }

  async handleMessage({ messageData, author, messageBody, messageProps, messageType }: IHandleMessage): Promise<void> {
    if (messageBody.startsWith('/')) {
      const [commandQuery, ...args] = messageBody.replace('/', '').split(' ');
      const command = this.instance.commands.find((cmd) => cmd.name === commandQuery || cmd.aliases?.includes(commandQuery));
      if (command) return command.execute({ author, messageBody, messageData, messageProps, messageType }, args);
    }
  }
}
