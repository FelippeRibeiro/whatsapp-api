import { Request, Response } from 'express';
import { Whatsapp } from '../../../services/whatsapp/whatsapp';
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

  public sendFile = async (req: Request, res: Response) => {
    if (req.files) {
      let message = req.body.message || '';
      const to = req.body.to;
      if (!to) return res.status(400).send({ message: 'No receiver provided' });
      const files = (req.files as any)['file'] as Express.Multer.File[];
      const errors: { name: string; message: string }[] = [];
      for (const file of files) {
        try {
          const type = file.mimetype.split('/')[0];
          switch (type) {
            case 'video':
              await this.whatsapp.client.sendMessage(`${validNumber(to)}@s.whatsapp.net`, {
                video: file.buffer,
                mimetype: file.mimetype,
                caption: message,
              });
              message = '';
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
              message = '';
              break;

            default:
              await this.whatsapp.client.sendMessage(`${validNumber(to)}@s.whatsapp.net`, {
                document: file.buffer,
                mimetype: file.mimetype,
                fileName: file.originalname,
                caption: message,
              });
              message = '';
              break;
          }
        } catch (error) {
          errors.push({ name: file.originalname, message: error instanceof Error ? error.message : '' });
        }
      }
      return res.send({ status: 'ok', errors });
    }
    return res.status(400).send({ message: 'No files provided' });
  };
  public joinGroup = async (req: Request, res: Response) => {
    try {
      const { link } = req.body;
      const code = link.split('.com/')[1];
      const group = await this.whatsapp.client.groupAcceptInvite(code);
      console.log(group);
      res.status(200).json({ status: true });
    } catch (error) {
      res.status(500).json({ status: false });
    }
  };
}
