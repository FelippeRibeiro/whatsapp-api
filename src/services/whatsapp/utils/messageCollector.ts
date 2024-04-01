import { WAMessage } from '@whiskeysockets/baileys';
import { Whatsapp, WhatsappClient } from '../whatsapp';

interface AwaitMessagesOptions {
  jid: string;
  filter: (message: WAMessage) => Promise<boolean> | boolean;
  max: number;
  time: number;
}
export class MessageCollector {
  constructor(private whatsapp: WhatsappClient) {}

  async collect({ filter, jid, max, time }: AwaitMessagesOptions) {
    //Set e listener and resolver the promise when the filter and jid matches
    return new Promise((res) => {});
  }
}
