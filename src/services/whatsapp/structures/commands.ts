import { IHandleMessage } from '../interfaces/message.handler.interface';
import { WhatsappClient } from '../whatsapp';

interface ICommand {
  execute: (messagePayload: IHandleMessage, args: string[]) => Promise<any>;
  client: WhatsappClient;
  name: string;
  aliases?: string[];
}

export class Command implements ICommand {
  client: WhatsappClient;
  name: string;
  aliases?: string[];

  constructor(instance: WhatsappClient, options: { name: string; aliases?: string[]; args?: string }) {
    this.client = instance;
    this.name = options.name;
    this.aliases = options.aliases;
    console.log(`Comando ${this.name} carregado!`);
  }

  async execute({ author, messageBody, messageData, messageProps }: IHandleMessage, args: string[]) {}
}
