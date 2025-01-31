import { Whatsapp } from '../../../whatsapp';
import { SendMessageBody } from '../../dto/send-message-dto';

export class SendMessageService {
  async sendMessage(instance: Whatsapp, body: SendMessageBody) {
    let erros = [];
    for (const remote of body.remoteJid) {
      await instance.sendMessage(remote, { text: body.text });
    }
  }
}
