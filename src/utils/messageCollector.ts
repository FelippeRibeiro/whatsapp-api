import { IHandleMessage } from '../interfaces/message.handler.interface';

export class MessageCollector {
  messageCollectorMap = new Map<string, { handle: (message: IHandleMessage) => void; chatId: string | undefined }>();

  async awaitMessage(author: string, chatId?: string) {
    return new Promise<IHandleMessage>((resolve) => {
      this.messageCollectorMap.set(author, { handle: resolve, chatId });
    });
  }
}
