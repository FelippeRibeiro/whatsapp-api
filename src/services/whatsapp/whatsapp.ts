import makeWASocket, {
  Browsers,
  DisconnectReason,
  makeInMemoryStore,
  useMultiFileAuthState,
  WAConnectionState,
  WASocket,
  delay,
} from '@whiskeysockets/baileys';
import { readdirSync, rmSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { Boom } from '@hapi/boom';
import { MessageUpsertController } from './controller/message.upsert';
import { IContacts } from './interfaces/contacts';
import { Command } from './structures/commands';
import pino from 'pino';
import { IInstanceSettings } from './interfaces/instance.settings';
import * as qrcode from 'qrcode';

export type WhatsappClient = ReturnType<typeof makeWASocket>;

const defaultInstanceSettings: IInstanceSettings = {
  commandPrefix: '/',
  enableCommands: true,
  ignoreCommands: [],
  ignoreGroups: [],
  ignoreGroupsMessage: false,
  ignoreJid: [],
  ignoreStatusMessage: true,
  syncHistory: true,
};

export class Whatsapp {
  instanceName: string = '';
  public client: WASocket | undefined;
  clientConnected: boolean = false;
  conectionStatus: { state: WAConnectionState; statusReason?: number } = { state: 'close' };
  commands: Command[] = [];
  conversations: { chatId: string; messages: any[] }[] = [];
  contacts: IContacts[] = [];
  settings: IInstanceSettings;
  qr: { qr: string; base64: string; count: number } = { base64: '', qr: '', count: 0 };
  store: ReturnType<typeof makeInMemoryStore>;

  constructor(instanceName: string, settings: IInstanceSettings | null) {
    if (!instanceName) throw new Error('Instance name is required');
    this.instanceName = instanceName;
    this.settings = settings || defaultInstanceSettings;
    this.store = makeInMemoryStore({});
  }

  async connectToWhatsApp() {
    const { saveCreds, state } = await useMultiFileAuthState(`auth/${this.instanceName}`);
    this.client = makeWASocket({
      printQRInTerminal: true,
      browser: Browsers.appropriate('Chrome'),
      auth: state,
      logger: pino({ level: 'silent' }) as any,
      markOnlineOnConnect: true,
      defaultQueryTimeoutMs: undefined,
      emitOwnEvents: false,
      generateHighQualityLinkPreview: true,
      syncFullHistory: this.settings.syncHistory,
      qrTimeout: 45_000,
      shouldIgnoreJid: (jid) => {
        if (
          this.settings.ignoreJid.includes(jid) ||
          this.settings.ignoreJid.includes(`${jid}@s.whatsapp.net`) ||
          this.settings.ignoreJid.includes(`${jid}@g.us`)
        )
          return true;
        if (this.settings.ignoreStatusMessage && jid === 'status@broadcast') return true;
        if (this.settings.ignoreGroupsMessage && jid.includes('@g.us')) return true;
        return false;
      },
    });
    this.client.ev.on('creds.update', saveCreds);
    this.eventsHandlers();
    if (this.settings.enableCommands) this.loadCommands();
    return this;
  }

  private eventsHandlers() {
    if (!this.client) return;
    this.store.readFromFile('store.json');
    setInterval(() => this.store.writeToFile('store.json'), 10_000);
    this.store.bind(this.client.ev);

    this.client?.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      if (lastDisconnect) console.error(lastDisconnect.error as Boom);

      if (qr) {
        this.qr.count++;
        this.qr.qr = qr;
        qrcode.toDataURL(qr, (err, url) => {
          if (err) return;
          this.qr.base64 = url;
        });
      }

      if (connection) {
        this.conectionStatus = {
          state: connection,
          statusReason: (lastDisconnect?.error as Boom)?.output?.statusCode ?? 200,
        };
      }

      if (connection === 'open') {
        this.clientConnected = true;
        console.log(`Conectado!`, this.instanceName);
        this.client?.ev.flush();
        await this.client?.uploadPreKeysToServerIfRequired();
      }

      if (connection === 'close') {
        this.clientConnected = false;
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

        console.error('connection closed due to ', lastDisconnect?.error?.message, ', reconnecting ', shouldReconnect, this.instanceName);
        if (shouldReconnect) {
          console.warn('Reconnecting to whatsapp!!', this.instanceName);
          await this.connectToWhatsApp();
        } else {
          console.warn('Excluindo arquivos de autenticação', this.instanceName);
          //Send some notification
          rmSync('auth', { recursive: true, force: true });
          if (lastDisconnect?.error?.message !== 'Intentional Logout') this.connectToWhatsApp();
        }
      }
      if (connection === 'connecting') console.log('Conectando', this.instanceName);
    });

    // this.client.ev.on('chats.upsert', async (update) => {
    //   console.log('chats.upsert', store.chats.all());
    //   writeFileSync('chats.json', JSON.stringify(store.chats.all(), null, 2));
    // });

    // this.client.ev.on('contacts.update', async (contacts) => {
    //   console.log('contacts.update', Object.values(store.contacts));
    //   writeFileSync('contacts.json', JSON.stringify(Object.values(store.contacts), null, 2));
    //   const contactsRaw = [];
    //   for await (const contact of Object.values(store.contacts)) {
    //     if (contact.id === 'status@broadcast') continue;
    //     if (!contact.id) continue;
    //     contactsRaw.push({
    //       id: contact.id,
    //       pushName: contact?.name ?? contact?.verifiedName,
    //       profilePictureUrl: (await this.profilePicture(contact.id)).profilePictureUrl,
    //       // owner: this.instance.name,
    //     });
    //   }
    //   console.log({ contactsRaw });
    //   writeFileSync('contacts-raw.json', JSON.stringify(contactsRaw, null, 2));
    // });

    this.client.ev.on('messaging-history.set', async (update) => {
      // if (!update.isLatest) return;
      for (const message of update.messages) {
        if (!message.message || !message.key || !message.messageTimestamp) continue;
        const chatId = message.key.remoteJid;
        if (!chatId) return;
        const conversation = this.conversations.find((conv) => conv.chatId === chatId);
        if (conversation) conversation.messages.push(message);
        else this.conversations.push({ chatId, messages: [message] });
      }

      // writeFileSync(`history-set/messaging-history-${new Date().getTime()}.json`, JSON.stringify(update, null, 2));
      // writeFileSync('conversation.json', JSON.stringify(this.conversations, null, 2));
    });

    const messageUpsertController = new MessageUpsertController(this);
    this.client.ev.on('messages.upsert', (update) =>
      messageUpsertController.handleEvent(update).catch((err) => console.error('unhandled error on Handle event controller', err))
    );
  }

  public async profilePicture(jid: string) {
    try {
      if (!this.client) throw new Error('Client not connected');
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

  public async getInfo() {
    const defaultInfo = {
      name: this.instanceName,
      connected: this.clientConnected,
      settings: this.settings,
      conectionStatus: this.conectionStatus,
      qr: this.qr,
    };

    if (this.client?.authState.creds.me)
      return {
        ...defaultInfo,
        auth: this.client.authState.creds.me || null,
        photo: await this.profilePicture(this.client.authState.creds.me.id),
      };
    return {
      auth: null,
      photo: null,
      ...defaultInfo,
    };
  }

  public getMessages(chatId: string) {
    if (!this.client) throw new Error('Client not connected');

    const messages = this.store.messages[chatId].toJSON().sort((a, b) => parseInt(String(a.messageTimestamp)) - parseInt(String(b.messageTimestamp)));

    return messages;
  }

  public async getChats() {
    const chats = this.store.chats.all().map((chat) => ({
      id: chat.id,
      name: chat.name || chat.displayName || chat.username || chat.id.split('@')[0],
      messages: this.getMessages(chat.id).at(-1),
      unreadCount: chat.unreadCount,
      pinned: chat.pinned,
      archived: chat.archived,
      isParentGroup: chat.isParentGroup,
      isDefaultSubgroup: chat.isDefaultSubgroup,
    }));
    return chats;
  }

  public async logout() {
    if (this.client) {
      await this.client.logout();
      await delay(1500);
      const ev = this.client.ev;
      ev.removeAllListeners('blocklist.set');
      ev.removeAllListeners('messages.upsert');
      ev.removeAllListeners('messages.update');
      ev.removeAllListeners('connection.update');
      ev.removeAllListeners('chats.upsert');
      ev.removeAllListeners('contacts.update');
      ev.removeAllListeners('messaging-history.set');
      ev.removeAllListeners('call');
      ev.removeAllListeners('creds.update');
    }
  }

  private loadCommands() {
    if (this.commands.length) this.commands = [];
    const path = resolve(__dirname, 'commands');
    const commandFiles = readdirSync(path).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));
    for (const commandFile of commandFiles) {
      const commandPath = resolve(path, commandFile);
      const Command = require(commandPath).default;
      this.commands.push(new Command(this.client));
    }
  }
}
