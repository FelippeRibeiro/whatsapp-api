import { WhatsappClient } from '../whatsapp';
import { CronJob } from 'cron';

export class Jobs {
  static fistTime = false;
  constructor(private client: WhatsappClient) {
    if (Jobs.fistTime === false) {
      console.log('Setting Jobs');
      this.setJobs();
      Jobs.fistTime = true;
    }
  }

  setJobs() {
    new CronJob('0 9 * * *', this.sendGoodMorning.bind(this), null, true);
  }
  async sendGoodMorning() {
    await this.client.sendMessage('557193277415@s.whatsapp.net', { text: `Bom dia!` });
  }
}
const delay = (time: number) => new Promise((resolve) => setTimeout(resolve, time));
// 120363041254057068@g.us  //SL Processos Grupo ID
