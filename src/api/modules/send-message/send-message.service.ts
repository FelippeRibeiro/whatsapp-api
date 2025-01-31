import { validNumber } from '../../../utils/valideNumber';
import { Whatsapp } from '../../../whatsapp';
import { SendMessageBody } from '../../dto/send-message-dto';

export class SendMessageService {
  async sendTextMessage(instance: Whatsapp, body: SendMessageBody) {
    const errors = [];
    const sucess = [];

    for (const remote of body.remoteJid) {
      try {
        const remoteJid = validNumber(remote);
        const checkJid = await instance.client!.onWhatsApp(remoteJid);

        if (checkJid && checkJid.length && checkJid[0].exists) {
          await instance.sendMessage(checkJid[0].jid, { text: body.text });
          sucess.push({ remote, message: 'ok' });
        } else errors.push({ remote, message: 'Número não esta registrado no whatsapp!' });
      } catch (error) {
        if (error instanceof Error) errors.push({ remote, message: error.message });
      }
    }

    return { errors, sucess };
  }
}
