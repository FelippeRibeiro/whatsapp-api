import { readFileSync } from 'fs';
import { Whatsapp } from './whatsapp';

async function main() {
  const settings = JSON.parse(readFileSync('./settings.json', 'utf-8')) || {
    commandPrefixies: ['/', '!', '.'],
    enableCommands: true,
    ignoreCommands: [],
    ignoreGroups: [],
    ignoreGroupsMessage: false,
    ignoreJid: [],
    ignoreStatusMessage: true,
    syncHistory: true,
    admins: ['557193277415'],
  };

  const client = new Whatsapp('butterbot', settings);
  client.connectToWhatsApp();
}

main();

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
