import { Request, Response } from 'express';
import { Whatsapp } from '../../../services/whatsapp';
import { validNumber } from '../../../util/valideNumber';
export class WhatsappService {
  whatsapp: Whatsapp;
  constructor(whatsappClient: Whatsapp) {
    console.log(whatsappClient.client.user);
    this.whatsapp = whatsappClient;
  }

  public sendMessage = async (req: Request, res: Response) => {
    const { number, message } = req.body;
    await this.whatsapp.client.sendMessage(`${validNumber(number)}@s.whatsapp.net`, { text: message });
    res.send({ status: 'ok' });
  };
}
