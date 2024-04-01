import { Request, Response } from 'express';
import { registerBody } from './schemas/register.schemas';
export class AuthService {
  public register = async (req: Request, res: Response) => {
    const valid = registerBody.safeParse(req.body);
    if (!valid.success) return res.status(400).json(valid.error.flatten().fieldErrors);
    const { email, name, telefone } = valid.data;
    console.log({ name, email, telefone });
    res.send(true);
  };
}
