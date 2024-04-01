import { MessageUpsertType, WAMessage, proto } from '@whiskeysockets/baileys';
import { WhatsappClient } from '../whatsapp';

interface AwaitMessagesOptions {
  jid: string;
  filter: (message: WAMessage) => Promise<boolean> | boolean;
  max: number;
  time: number;
}
export interface MessagesInterface {
  messages: proto.IWebMessageInfo[];
  type: MessageUpsertType;
}
export class MessageCollector {
  private collectedMessages: WAMessage[] = [];
  private eventHandler: (({ messages }: MessagesInterface) => void) | undefined;
  private timeout: NodeJS.Timeout | undefined;

  constructor(private instance: WhatsappClient) {}

  async awaitMessages({ jid, filter, max, time }: AwaitMessagesOptions): Promise<WAMessage[]> {
    return new Promise((resolve) => {
      this.timeout = setTimeout(() => {
        this.cleanup();
        resolve(this.collectedMessages);
      }, time);

      this.eventHandler = async ({ messages }: MessagesInterface) => {
        const messageData = messages[0];

        if (messageData.key.fromMe || messageData.key.remoteJid !== jid) {
          return;
        }

        const isFilter = await filter(messageData);
        if (!isFilter) return;

        this.collectedMessages.push(messageData);

        if (this.collectedMessages.length === max) {
          this.cleanup();
          resolve(this.collectedMessages);
        }
      };

      this.instance.ev.on('messages.upsert', this.eventHandler);
    });
  }

  private cleanup(): void {
    if (this.eventHandler) {
      this.instance.ev.off('messages.upsert', this.eventHandler);
      this.eventHandler = undefined;
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
  }

  clearMessages(): void {
    this.collectedMessages = [];
  }
}
