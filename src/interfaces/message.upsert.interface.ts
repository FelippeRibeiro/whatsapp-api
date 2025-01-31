import { MessageUpsertType, WAMessage } from 'baileys';
import { Whatsapp } from '../whatsapp';

export interface IMessageUpsertEventPayload {
  messages: WAMessage[];
  type: MessageUpsertType;
  requestId?: string;
}

export interface IMessageUpsertController {
  instance: Whatsapp;
  handleEvent(messagesUpsert: IMessageUpsertEventPayload): Promise<void>;
}
