import { Jobs } from '../jobs/jobs';
import { Command } from '../structures/commands';
import { WhatsappClient } from '../whatsapp';
import { WAMessage } from '@whiskeysockets/baileys';

export default class RoutineCommand extends Command {
  constructor(client: WhatsappClient) {
    super(client, { name: 'rotina' });
  }

  async execute(message: WAMessage): Promise<void> {
    await new Jobs(this.client).sendGoodMorning();
  }
}
