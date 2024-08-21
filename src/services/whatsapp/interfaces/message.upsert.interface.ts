import { MessageUpsertType, proto } from '@whiskeysockets/baileys';

export interface IMessageUpsertEventPayload {
  messages: proto.IWebMessageInfo[];
  type: MessageUpsertType;
}
