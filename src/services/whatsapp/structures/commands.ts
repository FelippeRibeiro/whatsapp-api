import { WhatsappClient } from '../whatsapp';
import { type WAMessage } from '@whiskeysockets/baileys';

interface ICommand {
  execute: (message: WAMessage, args: { messageBody: string; author: string }) => Promise<void>;
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

  async execute(message: WAMessage, args: { messageBody: string; author: string }): Promise<void> {}
}
