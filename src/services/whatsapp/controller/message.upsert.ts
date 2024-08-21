import { getMessageType } from '../utils/getMessageType';
import { getMessageBody } from '../utils/getBodyMessage';
import { Whatsapp } from '../whatsapp';
import { IMessageUpsertEventPayload } from '../interfaces/message.upsert.interface';
import { IHandleNoTextMessage, IHandleTextMessage } from '../interfaces/message.handler.interface';
export class MessageUpsertController {
  constructor(private instance: Whatsapp) {}

  async handleEvent(messagesUpsert: IMessageUpsertEventPayload) {
    const messageData = messagesUpsert.messages[0];
    if (messageData.key.fromMe) return; // Early return if the message is from the bot
    const chatJid = messageData.key.remoteJid;
    if (!chatJid || chatJid === 'status@broadcast') return; // Early return if the message is from a broadcast status

    const messageProps = messageData.message;
    const messageType = getMessageType(messageData);
    const author = messageData.key.participant ?? messageData.key.remoteJid;
    if (!author || !messageProps || !messageType) return; // Early return if the message has no author, props or type bellow this line

    const messageBody = getMessageBody(messageData);
    const authorNumber = author!.split('@')[0];

    if (messageBody) return this.handleTextMessage({ messageData, author: authorNumber, messageBody });
    else return this.handleNoTextMessage({ messageData, author: authorNumber });
  }

  async handleTextMessage({ messageData, author, messageBody }: IHandleTextMessage): Promise<void> {
    if (messageBody.startsWith('/')) {
      const [commandQuery, ...args] = messageBody.replace('/', '').split(' ');
      const command = this.instance.commands.find((cmd) => cmd.name === commandQuery || cmd.aliases?.includes(commandQuery));
      if (command) return command.execute(messageData, { author, messageBody });
    }
  }

  async handleNoTextMessage({ messageData, author }: IHandleNoTextMessage): Promise<void> {}
}
