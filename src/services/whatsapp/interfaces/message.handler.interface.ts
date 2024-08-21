import { MessageType, proto } from '@whiskeysockets/baileys';

export type TMessageProps = proto.IMessage;
export type TMessageData = proto.IWebMessageInfo;

export interface IHandleMessage {
  messageData: TMessageData;
  messageProps: TMessageProps;
  messageType: MessageType;
  author: string;
  messageBody: string;
}
