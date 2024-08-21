import { Jobs } from '../../jobs/jobs';
import { IHandleMessage } from '../interfaces/message.handler.interface';
import { Command } from '../structures/commands';
import { WhatsappClient } from '../whatsapp';
import { WAMessage } from '@whiskeysockets/baileys';

export default class PingCommand extends Command {
  constructor(client: WhatsappClient) {
    super(client, { name: 'ping' });
  }

  async execute({ author, messageBody, messageData, messageProps }: IHandleMessage, args: string[]): Promise<void> {
    await new Jobs().sendPing();
  }
}
