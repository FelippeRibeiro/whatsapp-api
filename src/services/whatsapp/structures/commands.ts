import { WhatsappClient } from '../whatsapp';
import { type WAMessage } from '@whiskeysockets/baileys';

interface execute {
  execute: (message: WAMessage) => void;
}

export class Command implements execute {
  client: WhatsappClient;
  name: string;
  aliases?: string[];
  args?: string;

  constructor(instance: WhatsappClient, options: { name: string; aliases?: string[]; args?: string }) {
    this.client = instance;
    this.name = options.name;
    this.aliases = options.aliases;
    this.args = options.args;
    console.log(`Comando ${this.name} carregado!`);
  }

  async execute(message: WAMessage) {}
}
