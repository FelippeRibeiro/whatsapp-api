import { IHandleMessage } from '../../interfaces/message.handler.interface';
import { Command } from '../../structures/commands';
import { Whatsapp } from '../../whatsapp';

export default class PingCommand extends Command {
  constructor(instance: Whatsapp) {
    super(instance, {
      name: 'ping',
      aliases: ['ping', 'pong', 'latency'],
      description: 'Comando para testar se o bot está ativo e ver informações do dispositivo!',
    });
  }

  async execute({ author, messageBody, messageData, messageProps, chatJid, messageQuoted, messageType }: IHandleMessage, args: string[]): Promise<void> {
    await this.instance.client?.sendMessage(
      chatJid,
      {
        text: 'PING Especifico',
      },
      { quoted: messageData },
    );
  }
}
