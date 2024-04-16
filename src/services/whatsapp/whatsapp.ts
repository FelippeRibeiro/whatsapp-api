import makeWASocket, { DisconnectReason, useMultiFileAuthState, Browsers } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { rmSync } from 'fs';
import { MessageUpsertController } from './controller/message.upsert';
import { Jobs } from './jobs/jobs';

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
        new Jobs(this.client);
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
    client.ev.on('messages.upsert', (update) => new MessageUpsertController(this.client).handleEvent(update).catch((err) => true));

    // // Estudando eventos
    // [
    //   'connection.update',
    //   'creds.update',
    //   'messaging-history.set',
    //   'chats.upsert',
    //   'chats.update',
    //   'chats.phoneNumberShare',
    //   'chats.delete',
    //   'presence.update',
    //   'contacts.upsert',
    //   'contacts.update',
    //   'messages.delete',
    //   'messages.update',
    //   'messages.media-update',
    //   'messages.upsert',
    //   'messages.reaction',
    //   'message-receipt.update',
    //   'groups.upsert',
    //   'groups.update',
    //   'group-participants.update',
    //   'blocklist.set',
    //   'blocklist.update',
    //   'call',
    //   'labels.edit',
    //   'labels.association',
    // ].forEach((event) => {
    //   client.ev.on(event as BaileysEvent, (update) => {
    //     console.log(event);
    //     if (event == 'messaging-history.set' && (update as any).isLatest == false) return;
    //     writeFileSync(`${event}.json`, JSON.stringify(update));
    //   });
    // });
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
