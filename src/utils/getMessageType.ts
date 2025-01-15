import { MessageType, proto } from '@whiskeysockets/baileys';

export function getMessageType(message: proto.IMessage) {
  return Object.keys(message)[0] as MessageType;
}

export function getMessageTypes(message: proto.IMessage) {
  return Object.keys(message);
}
