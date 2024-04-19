import { WhatsappClient } from '../whatsapp';
import { CronJob } from 'cron';

export class Jobs {
  static fistTime = true;
  constructor(private client: WhatsappClient) {}

  setJobs() {
    if (Jobs.fistTime === false) return;
    console.log('Setting Jobs');
    new CronJob('0 9 * * *', this.sendPing.bind(this), null, true);
    Jobs.fistTime = false;
  }
  async sendPing() {
    await this.client.sendMessage('557193277415@s.whatsapp.net', { text: `Ping!` });
  }
}
const delay = (time: number) => new Promise((resolve) => setTimeout(resolve, time));
