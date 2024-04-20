import { Whatsapp, WhatsappClient } from '../whatsapp/whatsapp';
import { CronJob } from 'cron';

export class Jobs {
  setJobs() {
    console.log('Setting Jobs');
    new CronJob('0 9 * * *', this.sendPing.bind(this), null, true);
  }
  async sendPing() {
    const { client } = await Whatsapp.getInstance();
    await client.sendMessage('557193277415@s.whatsapp.net', { text: `Ping!` });
  }
}
const delay = (time: number) => new Promise((resolve) => setTimeout(resolve, time));
