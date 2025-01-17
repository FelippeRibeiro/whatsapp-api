import { MessageUpsertType, proto } from '@whiskeysockets/baileys';
import { Whatsapp } from '../whatsapp';

export interface IMessageUpsertEventPayload {
  messages: proto.IWebMessageInfo[];
  type: MessageUpsertType;
}

export interface IMessageUpsertController {
  instance: Whatsapp;
  handleEvent(messagesUpsert: IMessageUpsertEventPayload): Promise<void>;
}
