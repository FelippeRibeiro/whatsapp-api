import { IHandleMessage } from '../../interfaces/message.handler.interface';
import { IMessageUpsertController, IMessageUpsertEventPayload } from '../../interfaces/message.upsert.interface';
import { getMessageBody } from '../../utils/getBodyMessage';
import { getMessageType } from '../../utils/getMessageType';
import { getQuotedMessage } from '../../utils/getQuotedMessage';
import { Whatsapp } from '../../whatsapp';

export default class MessageUpsertController implements IMessageUpsertController {
  constructor(public instance: Whatsapp) {}

  async handleEvent({ messages, type }: IMessageUpsertEventPayload) {
    for (const messageData of messages) {
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

      const payload: IHandleMessage = { author, chatJid, isGroup, messageBody, messageData, messageProps, messageType, messageQuoted };

      if (this.instance.messageCollector.messageCollectorMap.size) {
        if (this.instance.messageCollector.messageCollectorMap.has(author)) {
          await this.instance.client?.readMessages([messageData.key]);
          const collector = this.instance.messageCollector.messageCollectorMap.get(author);
          collector?.handle({ author, messageBody, messageData, messageProps, messageType, chatJid, messageQuoted, isGroup });
          this.instance.messageCollector.messageCollectorMap.delete(author);
          return;
        }
      }
      // Your logic
    }
  }
}
