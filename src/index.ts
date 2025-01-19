import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, watch, watchFile, writeFileSync } from 'fs';
import { Whatsapp } from './whatsapp';
import { IInstanceSettings, InstanceSettingSchema } from './interfaces/instance.settings';
import './interfaces/instance.settings';
import { join } from 'path';

import { ISessionsSettings } from './interfaces/sessions';

const defaultSetings: IInstanceSettings = InstanceSettingSchema.parse({});

class SessionsManager {
  instances = new Map<string, { instance: Whatsapp; name: string }>();

  constructor(private sessionsPath: string) {
    if (!existsSync(this.sessionsPath)) {
      mkdirSync(sessionsPath);
      console.log('Nenhuma sessão encontrada nas pasta Sessions\ncrie uma pasta com o nome da instancia e um arquivo settings.json para começar uma nova sessão!');
    }
    this.checkNewSessions();

    const sessionsFolders = readdirSync(sessionsPath);

    const sessionsSettings = sessionsFolders.map((folder) => {
      const path = join(sessionsPath, folder, 'settings.json');
      if (!existsSync(path)) {
        console.log(`Arquivo de configuração da instancia ${folder} não encontrado\nCriando arquivo com configuração padrão\nEdite em ${path}`);
        writeFileSync(path, JSON.stringify(defaultSetings, undefined, 2));
      }
      this.watchSettinsChange(path, folder);
      const setting = JSON.parse(readFileSync(path, { encoding: 'utf-8' }));

      return {
        name: folder,
        setting: InstanceSettingSchema.parse(setting),
      };
    });

    this.connectSessions(sessionsSettings);
  }

  async connectSessions(sessionsSettings: ISessionsSettings[]) {
    for await (const { name, setting } of sessionsSettings) {
      const client = await new Whatsapp(name, setting).connectToWhatsApp();
      this.instances.set(name, { instance: client, name });
      await client.waitForClientConnection();
    }
  }
  async handleNewSession() {
    const sessionsPath = join(__dirname, '..', 'sessions');
    const sessionsFolders = readdirSync(sessionsPath);

    for (const session of sessionsFolders) {
      if (this.instances.has(session)) continue;

      const settingPath = join(sessionsPath, session, 'settings.json');
      if (!existsSync(settingPath)) writeFileSync(settingPath, JSON.stringify(defaultSetings, undefined, 2));
      const setting = JSON.parse(readFileSync(settingPath, { encoding: 'utf-8' }));
      this.watchSettinsChange(settingPath, session);
      const client = await new Whatsapp(session, setting).connectToWhatsApp();
      this.instances.set(session, { instance: client, name: session });
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
          const session = this.instances.has(filename) ? this.instances.get(filename) : null;
          if (!session) return;
          session.instance.client?.logout('Intentional Logout');
          this.instances.delete(filename);
        }
      }
    });
  }
  watchSettinsChange(filepath: string, name: string) {
    watchFile(filepath, (cur, prev) => {
      console.log(`Settings changed ${name}`);
      if (this.instances.has(name) && existsSync(filepath)) {
        const neWsettings = JSON.parse(readFileSync(filepath, { encoding: 'utf-8' })) as IInstanceSettings;
        const client = this.instances.get(name)!;

        client.instance.settings = neWsettings;
        client.instance.loadCommands();
        client.instance.eventsHandlers();
        console.log(`Settings of ${name} applied`);
      }
    });
  }
  createNewSession(instanceName: string, settings: IInstanceSettings = defaultSetings) {
    if (existsSync(join(this.sessionsPath, instanceName))) throw new Error('Já existe uma instancia com esse nome');
    mkdirSync(join(this.sessionsPath, instanceName));
    writeFileSync(join(this.sessionsPath, instanceName, 'settings.json'), JSON.stringify(settings, undefined, 2));
    return { instanceName, settings };
  }
}

new SessionsManager(join(__dirname, '..', 'sessions'));

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
