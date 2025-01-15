import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { IHandleMessage } from '../interfaces/message.handler.interface';
import { Command } from '../structures/commands';
import { MessageCollector } from '../utils/messageCollector';
import { Whatsapp } from '../whatsapp';

export default class SshCommand extends Command {
  server: ChildProcessWithoutNullStreams | undefined;
  constructor(instance: Whatsapp) {
    super(instance, {
      name: 'ssh',
      aliases: ['ssh'],
      developerOnly: true,
    });
  }

  async execute({ author, messageBody, messageData, messageProps, chatJid, messageQuoted, messageType }: IHandleMessage, args: string[]): Promise<void> {
    if (!this.server) this.server = spawn('bash');
    await this.instance.sendMessage(chatJid, { text: 'Sessão iniciada!\nEnvie: "exit" para finalizar a sessão!' });

    this.server.stdout.on('data', async (data) => {
      await this.instance.sendMessage(chatJid, { text: data.toString() });
    });

    this.server.stdout.on('error', async (e) => {
      await this.instance.sendMessage(chatJid, { text: `Error: ${e.message}` });
    });
    this.server.stdout.on('close', async () => {
      await this.instance.sendMessage(chatJid, { text: `Sessão finalizada!` });
    });

    if (args.length) this.server.stdin.write(`${args.join('')}\n`);

    while (this.server) {
      const message = await new MessageCollector().awaitMessage(author);

      if (message.messageBody == 'exit') {
        this.server.kill();
        this.server = undefined;
        break;
      }
      this.server.stdin.write(`${message.messageBody}\n`);
    }
  }
}
