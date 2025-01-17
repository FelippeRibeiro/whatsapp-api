import { Boom } from '@hapi/boom';
import makeWASocket, {
  AnyMessageContent,
  Browsers,
  delay,
  DisconnectReason,
  makeInMemoryStore,
  MiscMessageGenerationOptions,
  proto,
  useMultiFileAuthState,
  WAConnectionState,
  WAMessageContent,
  WAMessageKey,
  WASocket,
} from '@whiskeysockets/baileys';
import { existsSync, readdirSync, rmSync } from 'fs';
import { resolve } from 'path';
import pino from 'pino';
import * as qrcode from 'qrcode';

import { MessageUpsertController } from './controller/message.upsert';

import { IInstanceSettings } from './interfaces/instance.settings';
import { Command } from './structures/commands';
import { Publisher } from './structures/publisher-subscribers';

export type WhatsappClient = ReturnType<typeof makeWASocket>;

export class Whatsapp {
  instanceName: string;
  settings: IInstanceSettings;

  client: WASocket | undefined;
  clientConnected: boolean = false;
  conectionStatus: { state: WAConnectionState; statusReason?: number } = { state: 'close' };

  qr: { qr: string; base64: string; count: number } = { base64: '', qr: '', count: 0 };

  commands: Command[] = [];
  publisher = new Publisher();
  store: ReturnType<typeof makeInMemoryStore> | undefined;

  constructor(instanceName: string, settings: IInstanceSettings) {
    if (!instanceName) throw new Error('Instance name is required');
    this.instanceName = instanceName;
    this.settings = settings;
  }

  async connectToWhatsApp() {
    const { saveCreds, state } = await useMultiFileAuthState(`sessions/${this.instanceName}/auth`);
    this.store = makeInMemoryStore({});
    this.client = makeWASocket({
      printQRInTerminal: true,
      browser: Browsers.appropriate('safari'),
      auth: state,
      logger: pino({ level: 'silent' }) as any,
      markOnlineOnConnect: true,
      emitOwnEvents: false,
      generateHighQualityLinkPreview: true,
      syncFullHistory: this.settings.syncHistory,
      qrTimeout: 45_000,
    });

    this.client.ev.on('creds.update', saveCreds);
    this.eventsHandlers();
    if (this.settings.enableCommands) this.loadCommands();
    this.loadSubscribers();
    this.loadJobs();

    if (!this.client.authState.creds.registered && this.settings.number) {
      await delay(1000);
      const pairingCode = await this.client.requestPairingCode(this.settings.number);
      const formattedPairingCode = `${pairingCode.slice(0, 4)}-${pairingCode.slice(4)}`;
      console.log({ formattedPairingCode, pairingCode });
    }

    return this;
  }

  private eventsHandlers() {
    if (!this.client) return;
    this.store?.readFromFile(`sessions/${this.instanceName}/store.json`);
    setInterval(() => this.store?.writeToFile(`sessions/${this.instanceName}/store.json`), 10_000);
    this.store?.bind(this.client.ev);

    this.client.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

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
      }

      if (connection === 'close') {
        this.clientConnected = false;
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

        console.error('connection closed due to ', lastDisconnect?.error?.message, ', reconnecting ', shouldReconnect, this.instanceName);
        if (shouldReconnect) {
          console.warn('Reconnecting to whatsapp!!', this.instanceName);
          this.connectToWhatsApp();
        } else {
          console.warn('Excluindo arquivos de autenticação', this.instanceName);
          //Send some notification
          rmSync('auth', { recursive: true, force: true });
          if (lastDisconnect?.error?.message !== 'Intentional Logout') this.connectToWhatsApp();
        }
      }
      if (connection === 'connecting') console.log('Conectando', this.instanceName);
    });

    this.client.ev.on('call', async (calls) => {
      await this.client?.rejectCall(calls[0].id, calls[0].from);
      if (this.settings.admins.includes(calls[0].from)) return;
      if (this.settings.blockOnCall) await this.client?.updateBlockStatus(calls[0].from, 'block');
    });

    const messageUpsertController = new MessageUpsertController(this);
    this.client.ev.on('messages.upsert', (update) => messageUpsertController.handleEvent(update).catch((err) => console.error('unhandled error on Handle event controller', err)));
  }

  async waitForClientConnection() {
    return new Promise((resolve) => {
      if (this.clientConnected) resolve(true);
      const checker = setInterval(() => {
        if (!this.clientConnected) return;
        clearInterval(checker);

        resolve(true);
      });
    });
  }

  async getMessage(key: WAMessageKey): Promise<WAMessageContent | undefined> {
    if (this.store) {
      const msg = await this.store.loadMessage(key.remoteJid!, key.id!);
      return msg?.message || undefined;
    }
    return proto.Message.fromObject({});
  }

  async profilePicture(jid: string) {
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

  async getInfo() {
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

  async sendMessage(jid: string, content: AnyMessageContent, options?: MiscMessageGenerationOptions) {
    if (!this.client) throw new Error('Client not Connected');
    const message = await this.client.sendMessage(jid, content, options);
    return message;
  }

  loadCommands() {
    if (this.commands.length) this.commands = [];
    const path = resolve(__dirname, 'commands');
    const exists = existsSync(path);
    if (!exists) return;
    const commandFiles = readdirSync(path).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));
    for (const commandFile of commandFiles) {
      const commandPath = resolve(path, commandFile);
      const Command = require(commandPath).default;
      this.commands.push(new Command(this));
    }
    console.log(`Comandos carregados: [${this.commands.map((c) => c.name)}]`);
  }

  loadSubscribers() {
    if (this.publisher.subscribers.length) this.publisher.subscribers = [];
    const path = resolve(__dirname, 'subscribers');
    const exists = existsSync(path);
    if (!exists) return;
    const subscribersFiles = readdirSync(path).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

    for (const subscriber of subscribersFiles) {
      const subscriberPath = resolve(path, subscriber);
      const SubscriberClass = require(subscriberPath).default;
      this.publisher.addSubscriber(new SubscriberClass(this));
    }
    console.log(`Subscriber registrados: [ ${this.publisher.subscribers.length} ]`);
  }

  loadJobs() {
    const path = resolve(__dirname, 'jobs');
    const exists = existsSync(path);
    if (!exists) return;
    const jobFiles = readdirSync(path).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));
    for (const jobFile of jobFiles) {
      const jobPath = resolve(path, jobFile);
      const Job = require(jobPath).default;
      this.commands.push(new Job(this));
    }
  }
}
