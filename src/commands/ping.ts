import { cpu, currentLoad, mem } from 'systeminformation';
import { IHandleMessage } from '../interfaces/message.handler.interface';
import { Command } from '../structures/commands';
import { Whatsapp } from '../whatsapp';

export default class PingCommand extends Command {
  constructor(instance: Whatsapp) {
    super(instance, {
      name: 'ping',
      aliases: ['ping', 'pong', 'latency'],
      description: 'Comando para testar se o bot está ativo e ver informações do dispositivo!',
    });
  }

  async execute({ author, messageBody, messageData, messageProps, chatJid, messageQuoted, messageType }: IHandleMessage, args: string[]): Promise<void> {
    const cpuInfo = await this.getCpuInfo();
    const memoryInfo = await this.getMemoryInfo();

    await this.instance.client?.sendMessage(
      chatJid,
      {
        text: `🏓 ${messageBody.includes('ping') ? 'Pong!' : 'Ping!'}\n\n🖥️ INFOS CPU:\nModelo: ${cpuInfo.model}\nCores: ${cpuInfo.cores}\nUso: ${cpuInfo.usage}%\n💾 Memória:\nTotal: ${
          memoryInfo.total
        }\nUso: ${memoryInfo.usage} (${memoryInfo.usagePercentual}%)`,
      },
      { quoted: messageData },
    );
  }

  async getMemoryInfo() {
    const memory = await mem();
    return {
      total: `${(Number(memory.total) / 1024 / 1024 / 1000).toFixed(2)}GB`,
      usage: `${(Number(memory.used) / 1024 / 1024 / 1000).toFixed(2)}GB`,
      usagePercentual: ((Number(memory.used) / Number(memory.total)) * 100).toFixed(2),
    };
  }

  async getCpuInfo() {
    const currentLoadData = await currentLoad();
    const cpuData = await cpu();

    return {
      model: cpuData.brand,
      cores: cpuData.cores,
      usage: Math.round(currentLoadData.currentLoad),
    };
  }
}
