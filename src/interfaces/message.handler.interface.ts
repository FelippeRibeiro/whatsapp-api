import { MessageType, proto } from 'baileys';

export type TMessageProps = proto.IMessage;
export type TMessageData = proto.IWebMessageInfo;

export interface IHandleMessage {
  messageData: TMessageData;
  messageProps: TMessageProps;
  messageType: MessageType;
  author: string;
  chatJid: string;
  messageBody: string;
  messageQuoted?: { quotedMessage: proto.IMessage; quotedAuthor: null | undefined | string } | undefined;
  isGroup: boolean;
}
