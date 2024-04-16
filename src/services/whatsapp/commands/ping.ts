import { Jobs } from '../jobs/jobs';
import { Command } from '../structures/commands';
import { WhatsappClient } from '../whatsapp';
import { WAMessage } from '@whiskeysockets/baileys';

export default class PingCommand extends Command {
  constructor(client: WhatsappClient) {
    super(client, { name: 'ping' });
  }

  async execute(message: WAMessage): Promise<void> {
    await new Jobs(this.client).sendPing();
  }
}
