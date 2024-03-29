import { Request, Response } from 'express';
import { Whatsapp } from '../../../services/whatsapp';
import { validNumber } from '../../../util/valideNumber';
import { AnyMessageContent } from '@whiskeysockets/baileys';
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

  public sendFile = async (req: Request, res: Response) => {
    if (req.files) {
      try {
        const file = (req.files as any)['file'][0] as Express.Multer.File;
        const message = req.body.message || '';
        const to = req.body.to || '557193277415';
        console.log(file.mimetype);
        const type = file.mimetype.split('/')[0];

        switch (type) {
          case 'video':
            await this.whatsapp.client.sendMessage(`${validNumber(to)}@s.whatsapp.net`, {
              video: file.buffer,
              mimetype: file.mimetype,
              caption: message,
            });
            break;
          case 'audio':
            await this.whatsapp.client.sendMessage(`${validNumber(to)}@s.whatsapp.net`, {
              audio: file.buffer,
              mimetype: file.mimetype,
            });
            break;

          case 'image':
            await this.whatsapp.client.sendMessage(`${validNumber(to)}@s.whatsapp.net`, {
              image: file.buffer,
              mimetype: file.mimetype,
              caption: message,
            });
            break;

          default:
            await this.whatsapp.client.sendMessage(`${validNumber(to)}@s.whatsapp.net`, {
              document: file.buffer,
              mimetype: file.mimetype,
              fileName: file.originalname,
              caption: message,
            });
            break;
        }

        res.send({ status: 'ok' });
      } catch (error) {
        res.send(false);
      }
    }
  };
}
