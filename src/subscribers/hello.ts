import { IHandleMessage } from '../interfaces/message.handler.interface';
import { Subscriber } from '../structures/publisher-subscribers';
import { MessageCollector } from '../utils/messageCollector';
import { Whatsapp } from '../whatsapp';

export default class AcceptV4invite extends Subscriber {
  constructor(instance: Whatsapp) {
    super(instance);
  }

  update(update: IHandleMessage): void {
    if (update.messageBody.toLocaleLowerCase() == 'oi' && update.isGroup == false) {
      this.handler(update).catch((e) => console.log(e));
    }
  }

  async handler({ author, messageData, messageProps, chatJid }: IHandleMessage) {
    await this.instance.client?.sendMessage(chatJid, {
      text: 'Olá!',
    });
  }
}
