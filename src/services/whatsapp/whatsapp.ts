import makeWASocket, { DisconnectReason, useMultiFileAuthState, Browsers } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { readdirSync, rmSync } from 'fs';
import { MessageUpsertController } from './controller/message.upsert';
import { Jobs } from './jobs/jobs';
import { resolve } from 'path';
import { Command } from './structures/commands';

export type WhatsappClient = ReturnType<typeof makeWASocket>;

export class Whatsapp {
  private static instance: Whatsapp;

  public client: WhatsappClient;
  static clientConnected: boolean = false;
  commands: Command[] = [];

  private constructor() {
    this.client = {} as WhatsappClient;
    this.connectToWhatsApp();
  }
  async connectToWhatsApp() {
    const { saveCreds, state } = await useMultiFileAuthState('auth');

    this.client = makeWASocket({
      printQRInTerminal: true,
      browser: Browsers.appropriate('Chrome'),
      auth: state,
      logger: pino({ level: 'silent' }) as any,
      markOnlineOnConnect: true,
      defaultQueryTimeoutMs: undefined,
      emitOwnEvents: false,
    });

    this.client.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;
      if (lastDisconnect) console.error(lastDisconnect.error as Boom);

      if (connection === 'open') {
        Whatsapp.clientConnected = true;
        console.log('Conectado!');
        this.client.ev.flush();
        //That works??
        await this.client.uploadPreKeysToServerIfRequired();
        new Jobs(this.client).setJobs();
      }

      if (connection === 'close') {
        Whatsapp.clientConnected = false;
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

        console.log('connection closed due to ', lastDisconnect?.error?.message, ', reconnecting ', shouldReconnect);
        if (shouldReconnect) {
          console.log('Reconnecting to whatsapp!!');
          await this.connectToWhatsApp();
        } else {
          console.log('Excluindo arquivos de autenticação');
          //Send some notification
          rmSync('auth', { recursive: true, force: true });
          this.connectToWhatsApp();
        }
      }
      if (connection === 'connecting') console.log('Conectando');
    });

    this.client.ev.on('creds.update', saveCreds);
    this.client.ev.on('messages.upsert', (update) => new MessageUpsertController(Whatsapp.instance).handleEvent(update).catch((err) => true));
    this.loadCommands();
    Whatsapp.instance = this;
  }

  loadCommands() {
    if (this.commands.length) this.commands = [];
    const path = resolve(__dirname, 'commands');
    const commandFiles = readdirSync(path);
    for (const commandFile of commandFiles) {
      const commandPath = resolve(path, commandFile);
      const Command = require(commandPath).default;
      this.commands.push(new Command(this.client));
    }
  }
  public static async getInstance(): Promise<Whatsapp> {
    return new Promise<Whatsapp>((resolve, reject) => {
      if (!Whatsapp.instance) Whatsapp.instance = new Whatsapp();

      const interval = setInterval(() => {
        if (Whatsapp.clientConnected) {
          clearInterval(interval);
          resolve(Whatsapp.instance);
        }
      }, 1000);
    });
  }
}
