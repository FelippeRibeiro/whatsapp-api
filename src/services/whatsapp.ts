import makeWASocket, { DisconnectReason, useMultiFileAuthState, Browsers } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { rmSync } from 'fs';

export type WhatsappClient = ReturnType<typeof makeWASocket>;

export class Whatsapp {
  private static instance: Whatsapp;

  public client: WhatsappClient;
  static clientConnected: boolean = false;

  private constructor() {
    this.client = {} as WhatsappClient;
    this.connectToWhatsApp();
  }
  async connectToWhatsApp() {
    const { saveCreds, state } = await useMultiFileAuthState('auth');

    const client = makeWASocket({
      printQRInTerminal: true,
      browser: Browsers.appropriate('Chrome'),
      auth: state,
      logger: pino({ level: 'silent' }) as any,
      markOnlineOnConnect: true,
      defaultQueryTimeoutMs: undefined,
      emitOwnEvents: false,
    });

    this.client = client;

    client.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, isOnline } = update;

      if (connection === 'open') {
        Whatsapp.clientConnected = true;
        console.log('Conectado!');
        client.ev.flush();
        //That works??
        await client.uploadPreKeysToServerIfRequired();
      }

      if (connection === 'close') {
        Whatsapp.clientConnected = false;
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

        console.log('connection closed due to ', lastDisconnect?.error?.message, ', reconnecting ', shouldReconnect);
        if (shouldReconnect) {
          this.connectToWhatsApp();
        } else {
          console.log('Excluindo arquivos de autenticação');
          //Send some notification
          rmSync('auth', { recursive: true, force: true });
          this.connectToWhatsApp();
        }
      }
      if (connection === 'connecting') console.log('Conectando');
    });

    client.ev.on('creds.update', saveCreds);
    client.ev.on('messages.upsert', async (update) => {
      if (!update.messages[0].message) return;
      const msg = update.messages[0].message;
      const text = msg.conversation || msg.extendedTextMessage?.text;
      if (text === 'ping') {
        await client.sendMessage(update.messages[0].key.remoteJid!, { text: 'pong' });
      }
    });
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
