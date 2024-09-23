import makeWASocket, { DisconnectReason, useMultiFileAuthState, Browsers, makeInMemoryStore, BinaryNode, proto } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { readdirSync, rmSync, writeFileSync } from 'fs';
import { MessageUpsertController } from './controller/message.upsert';
import { resolve } from 'path';
import { Command } from './structures/commands';
import { IContacts } from './interfaces/contacts';

export type WhatsappClient = ReturnType<typeof makeWASocket>;

export class Whatsapp {
  private static instance: Whatsapp;

  public client: WhatsappClient;
  static clientConnected: boolean = false;
  commands: Command[] = [];
  conversations: { chatId: string; messages: any[] }[] = [];
  contacts: IContacts[] = [];

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
      generateHighQualityLinkPreview: true,
      syncFullHistory: true,
      // shouldIgnoreJid(jid) {
      //   return jid === 'status@broadcast';
      // },
    });

    const store = makeInMemoryStore({});
    store.readFromFile('store.json');
    setInterval(() => store.writeToFile('store.json'), 10_000);
    store.bind(this.client.ev);

    this.client.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;
      if (lastDisconnect) console.error(lastDisconnect.error as Boom);

      if (connection === 'open') {
        Whatsapp.clientConnected = true;
        console.log('Conectado!');
        this.client.ev.flush();
        //That works??
        await this.client.uploadPreKeysToServerIfRequired();
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

    this.client.ev.on('chats.upsert', async (update) => {
      console.log('chats.upsert', store.chats.all());
      writeFileSync('chats.json', JSON.stringify(store.chats.all(), null, 2));
    });

    this.client.ev.on('contacts.update', async (contacts) => {
      console.log('contacts.update', Object.values(store.contacts));
      writeFileSync('contacts.json', JSON.stringify(Object.values(store.contacts), null, 2));
      const contactsRaw = [];
      for await (const contact of Object.values(store.contacts)) {
        if (contact.id === 'status@broadcast') continue;
        if (!contact.id) continue;
        contactsRaw.push({
          id: contact.id,
          pushName: contact?.name ?? contact?.verifiedName,
          profilePictureUrl: (await this.profilePicture(contact.id)).profilePictureUrl,
          // owner: this.instance.name,
        });
      }
      console.log({ contactsRaw });
      writeFileSync('contacts-raw.json', JSON.stringify(contactsRaw, null, 2));
    });

    this.client.ws.on(`CB:edge_routing`, (node: BinaryNode) => {
      console.log('CB:edge_routing', node);
    });

    this.client.ws.on(`CB:edge_routing,id:abcd`, (node: BinaryNode) => {
      console.log('CB:edge_routing,id:abcd', node);
    });

    this.client.ws.on(`CB:edge_routing,id:abcd,routing_info`, (node: BinaryNode) => {
      console.log('CB:edge_routing,id:abcd,routing_info', node);
    });

    this.client.ev.on('messaging-history.set', async (update) => {
      // if (!update.isLatest) return;
      for (const message of update.messages) {
        if (!message.message || !message.key || !message.messageTimestamp) continue;
        console.log('Salvando conversation');
        const chatId = message.key.remoteJid;
        if (!chatId) return;
        const conversation = this.conversations.find((conv) => conv.chatId === chatId);
        if (conversation) conversation.messages.push(message);
        else this.conversations.push({ chatId, messages: [message] });
      }

      writeFileSync(`history-set/messaging-history-${new Date().getTime()}.json`, JSON.stringify(update, null, 2));
      writeFileSync('conversation.json', JSON.stringify(this.conversations, null, 2));
    });

    this.client.ev.on('creds.update', saveCreds);

    const messageUpsertController = new MessageUpsertController(Whatsapp.instance);
    this.client.ev.on('messages.upsert', (update) =>
      messageUpsertController.handleEvent(update).catch((err) => console.error('unhandled error on Handle event controller', err))
    );
    this.loadCommands();
  }

  public async profilePicture(jid: string) {
    try {
      return {
        wuid: jid,
        profilePictureUrl: await this.client.profilePictureUrl(jid, 'image'),
      };
    } catch (error) {
      return {
        wuid: jid,
        profilePictureUrl: null,
      };
    }
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
