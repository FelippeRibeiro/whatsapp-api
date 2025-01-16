import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, watch, watchFile, writeFileSync } from 'fs';
import { Whatsapp } from './whatsapp';
import { IInstanceSettings } from './interfaces/instance.settings';
import { join } from 'path';
import e from 'express';
import { ISessionsSettings } from './interfaces/sessions';

const defaultSetings: IInstanceSettings = {
  commandPrefixies: ['/'],
  enableCommands: true,
  ignoreCommands: [],
  ignoreGroups: [],
  ignoreGroupsMessage: false,
  ignoreJid: [],
  ignoreStatusMessage: true,
  syncHistory: true,
  admins: [],
  number: '',
  qrCode: true,
  blockOnCall: false,
};

class SessionsManager {
  actualSessions = new Map<string, { instance: Whatsapp; name: string; setting: IInstanceSettings }>();

  constructor(private sessionsPath: string) {
    if (!existsSync(this.sessionsPath)) {
      mkdirSync(sessionsPath);
      console.log('Nenhuma sessão encontrada nas pasta Sessions, crie uma pasta e um arquivo settings.json para começar uma nova sessão!');
    }
    this.checkNewSessions();

    const sessionsFolders = readdirSync(sessionsPath);

    const sessionsSettings = sessionsFolders.map((folder) => {
      const path = join(sessionsPath, folder, 'settings.json');
      if (!existsSync(path)) writeFileSync(path, JSON.stringify(defaultSetings, undefined, 2));
      this.watchSettinsChange(path, folder);
      return {
        name: folder,
        setting: JSON.parse(readFileSync(path, { encoding: 'utf-8' })) as IInstanceSettings,
      };
    });

    this.connectSessions(sessionsSettings);
  }

  async connectSessions(sessionsSettings: ISessionsSettings[]) {
    for await (const { name, setting } of sessionsSettings) {
      const client = await new Whatsapp(name, setting).connectToWhatsApp();
      this.actualSessions.set(name, { instance: client, name, setting });
      await client.waitForClientConnection();
    }
  }
  async handleNewSession() {
    const sessionsPath = join(__dirname, '..', 'sessions');
    const sessionsFolders = readdirSync(sessionsPath);

    for (const session of sessionsFolders) {
      if (this.actualSessions.has(session)) continue;

      const settingPath = join(sessionsPath, session, 'settings.json');
      if (!existsSync(settingPath)) writeFileSync(settingPath, JSON.stringify(defaultSetings, undefined, 2));
      const setting = JSON.parse(readFileSync(settingPath, { encoding: 'utf-8' }));
      this.watchSettinsChange(settingPath, session);
      const client = await new Whatsapp(session, setting).connectToWhatsApp();
      this.actualSessions.set(session, { instance: client, name: session, setting });
      await client.waitForClientConnection();
    }
  }

  checkNewSessions() {
    watch(this.sessionsPath, (event, filename) => {
      if (event == 'rename' && filename) {
        try {
          const isDirectory = statSync(join(this.sessionsPath, filename)).isDirectory();
          console.log(`New session created: ${filename}`);
          if (isDirectory) this.handleNewSession();
        } catch (error) {
          console.log(`Session deleted: ${filename}`);
          const session = this.actualSessions.has(filename) ? this.actualSessions.get(filename) : null;
          if (!session) return;
          session.instance.client?.logout('Intentional Logout');
        }
      }
    });
  }
  watchSettinsChange(filepath: string, name: string) {
    watchFile(filepath, (cur, prev) => {
      console.log(`Settings changed ${name}`);
      if (this.actualSessions.has(name) && existsSync(filepath)) {
        const neWsettings = JSON.parse(readFileSync(filepath, { encoding: 'utf-8' })) as IInstanceSettings;
        const client = this.actualSessions.get(name)!;
        client.setting = neWsettings;
        client.instance.settings = neWsettings;
        console.log(`Settings of ${name} applied`);
      }
    });
  }
}

new SessionsManager(join(__dirname, '..', 'sessions'));

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
