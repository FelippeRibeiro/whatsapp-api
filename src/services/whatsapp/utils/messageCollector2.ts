import { IHandleMessage } from '../interfaces/message.handler.interface';

export class MessageCollector {
  static messageCollectorMap = new Map<string, (message: IHandleMessage) => void>();

  async awaitMessage(author: string) {
    return new Promise<IHandleMessage>((resolve) => {
      MessageCollector.messageCollectorMap.set(author, resolve);
    });
  }
}
