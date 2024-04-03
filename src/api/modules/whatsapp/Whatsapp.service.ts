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
    const { number, message, ignoreNumberValidation } = req.body;
    const receiver = ignoreNumberValidation ? number : `${validNumber(number)}@s.whatsapp.net`;
    await this.whatsapp.client.sendMessage(receiver, { text: message });
    res.send({ status: 'ok' });
  };

  public sendFile = async (req: Request, res: Response) => {
    if (req.files) {
      let message = req.body.message || '';
      const to = req.body.to;
      if (!to) return res.status(400).send({ message: 'No receiver provided' });
      const ignoreNumberValidation = req.body.ignoreNumberValidation === 'true';
      const receiver = ignoreNumberValidation ? to : `${validNumber(to)}@s.whatsapp.net`;
      const files = (req.files as any)['file'] as Express.Multer.File[];
      const errors: { name: string; message: string }[] = [];
      for (const file of files) {
        try {
          const type = file.mimetype.split('/')[0];
          switch (type) {
            case 'video':
              await this.whatsapp.client.sendMessage(receiver, {
                video: file.buffer,
                mimetype: file.mimetype,
                caption: message,
              });
              message = '';
              break;
            case 'audio':
              await this.whatsapp.client.sendMessage(receiver, {
                audio: file.buffer,
                mimetype: file.mimetype,
              });
              break;

            case 'image':
              await this.whatsapp.client.sendMessage(receiver, {
                image: file.buffer,
                mimetype: file.mimetype,
                caption: message,
              });
              message = '';
              break;

            default:
              await this.whatsapp.client.sendMessage(receiver, {
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
      const code = link.replace('https://chat.whatsapp.com/', '');
      console.log({ code });
      const group = await this.whatsapp.client.groupGetInviteInfo(code);
      await this.whatsapp.client.groupAcceptInvite(code);
      res.status(200).json({ status: true, groupName: group.subject, groupId: group.id, ...group });
    } catch (error) {
      res.status(500).json({ status: false, message: error instanceof Error ? error.message : '' });
    }
  };
}
