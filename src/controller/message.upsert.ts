import { BufferJSON } from '@whiskeysockets/baileys';
import { readFileSync } from 'fs';
import { IHandleMessage } from '../interfaces/message.handler.interface';
import { IMessageUpsertController, IMessageUpsertEventPayload } from '../interfaces/message.upsert.interface';
import { Queue } from '../structures/queue';
import { getMessageBody } from '../utils/getBodyMessage';
import { getMessageType } from '../utils/getMessageType';
import { MessageCollector } from '../utils/messageCollector';
import { Whatsapp } from '../whatsapp';
import { getQuotedMessage } from '../utils/getQuotedMessage';

export class MessageUpsertController implements IMessageUpsertController {
  constructor(public instance: Whatsapp) {}

  async handleEvent(messagesUpsert: IMessageUpsertEventPayload) {
    const messageData = messagesUpsert.messages[0];

    // Early return if the message has no message core or is from the bot
    if (!messageData.message || messageData.key.fromMe) return;

    const chatJid = messageData.key.remoteJid;
    const isGroup = chatJid?.includes('@g.us') || false;

    if (!chatJid || (chatJid === 'status@broadcast' && this.instance.settings.ignoreStatusMessage)) return;
    // Early return if the message is from a broadcast status

    if (isGroup && this.instance.settings.ignoreGroupsMessage) return;
    // Early return if the message is from a group

    const messageType = getMessageType(messageData.message);
    const author = messageData.key.participant ?? messageData.key.remoteJid;
    if (!author) return;
    // Early return if the message has no author, props or type bellow this line

    if (this.instance.settings.ignoreJid.includes(author)) return;

    const messageProps = messageData.message;
    const messageBody = getMessageBody(messageProps);
    // if (!messageBody) return; // Early return if the message has no text content, just media. validate by you own
    const authorNumber = author!.split('@')[0];

    const messageQuoted = getQuotedMessage(messageData);

    if (MessageCollector.messageCollectorMap.size) {
      if (MessageCollector.messageCollectorMap.has(author)) {
        await this.instance.client?.readMessages([messageData.key]);
        const collector = MessageCollector.messageCollectorMap.get(author);
        collector?.handle({ author, messageBody, messageData, messageProps, messageType, chatJid, messageQuoted, isGroup });
        MessageCollector.messageCollectorMap.delete(author);
        return;
      }
    }

    try {
      await this.handleMessage({ messageData, author, messageBody, messageProps, messageType, chatJid, messageQuoted, isGroup });
    } catch (error) {
      error instanceof Error && console.log(error.message);
    }
  }

  private async handleMessage({ messageData, author, messageBody, messageProps, messageType, chatJid, messageQuoted, isGroup }: IHandleMessage): Promise<void> {
    if (this.instance.settings.enableCommands && this.instance.settings.commandPrefixies.some((prefix) => messageBody.startsWith(prefix))) {
      console.info(`${author.split('@')[0]} : (${messageType}) => ${messageBody}`);
      const [commandQuery, ...args] = messageBody.slice(1).split(' ');
      const command = this.instance.commands.find((cmd) => cmd.name === commandQuery.toLowerCase() || cmd.aliases?.includes(commandQuery.toLowerCase()));
      if (command) {
        await this.instance.client?.readMessages([messageData.key]);
        try {
          if (command.developerOnly && !this.instance.settings.admins.includes(author.split('@')[0])) return;
          if (command.onlyGroup && !chatJid.includes('@g.us')) {
            //Handle if command is only to groups
            return;
          }
          if (command.onlyGroupAdmin && chatJid.includes('@g.us')) {
            const groupData = await this.instance.client?.groupMetadata(chatJid);
            if (!groupData) return;
            const participant = groupData.participants.find((participant) => participant.id === author);
            if (!participant) return;
            if (participant.admin !== 'admin' && participant.admin !== 'superadmin') {
              //Handle if user isnt a admin
              return;
            }
          }
          Queue.add(() => command.execute({ author, messageBody, messageData, messageProps, messageType, messageQuoted, chatJid, isGroup }, args));
          return;
        } catch (error) {
          if (error instanceof Error) console.log('Erro no message handler: ', error.message);
        }
      }
    }

    this.instance.publisher.notifyAll({ author, chatJid, isGroup, messageBody, messageData, messageProps, messageType, messageQuoted }, this.instance);
  }
}

export const baseMessageUpsertController = `import { IMessageUpsertController, IMessageUpsertEventPayload } from '../../interfaces/message.upsert.interface';
import { Whatsapp } from '../../whatsapp';

export default class MessageUpsertController implements IMessageUpsertController {
  constructor(public instance: Whatsapp) {}

  async handleEvent(messagesUpsert: IMessageUpsertEventPayload): Promise<void> {
   
  }
}
`;
