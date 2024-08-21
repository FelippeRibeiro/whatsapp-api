import { proto } from '@whiskeysockets/baileys';

export type TMessageProps = proto.IMessage;
export type TMessageData = proto.IWebMessageInfo;

export interface IHandleTextMessage {
  messageData: TMessageData;
  author: string;
  messageBody: string;
}

export interface IHandleNoTextMessage {
  messageData: TMessageData;
  author: string;
}
