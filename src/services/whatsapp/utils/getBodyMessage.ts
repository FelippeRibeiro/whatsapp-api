import { MessageType, proto } from '@whiskeysockets/baileys';

export function getMessageBody(message: proto.IMessage): string {
  const messageType = Object.keys(message)[0] as MessageType;

  let body = '';
  switch (messageType) {
    case 'conversation':
      body = message.conversation ?? '';
      break;
    case 'imageMessage':
      body = message.imageMessage?.caption ?? '';
      break;
    case 'videoMessage':
      body = message.videoMessage?.caption ?? '';
      break;
    case 'extendedTextMessage':
      body = message.extendedTextMessage?.text ?? '';
      break;
    case 'buttonsResponseMessage':
      body = message.buttonsResponseMessage?.selectedButtonId ?? '';
      break;
    case 'listResponseMessage':
      body = message.listResponseMessage?.singleSelectReply?.selectedRowId ?? '';
      break;
    case 'templateButtonReplyMessage':
      body = message.templateButtonReplyMessage?.selectedId ?? '';
      break;
    case 'messageContextInfo':
      body =
        message.buttonsResponseMessage?.selectedButtonId ||
        message.listResponseMessage?.singleSelectReply?.selectedRowId ||
        message.conversation ||
        message.viewOnceMessage?.message?.imageMessage?.caption ||
        message.viewOnceMessage?.message?.videoMessage?.caption ||
        message.viewOnceMessageV2?.message?.videoMessage?.caption ||
        message.viewOnceMessageV2?.message?.imageMessage?.caption ||
        message.viewOnceMessageV2Extension?.message?.imageMessage?.caption ||
        message.viewOnceMessageV2Extension?.message?.videoMessage?.caption ||
        message.documentMessage?.caption ||
        message.imageMessage?.caption ||
        message.videoMessage?.caption ||
        message.extendedTextMessage?.text ||
        message.documentWithCaptionMessage?.message?.documentMessage?.caption ||
        '';
      break;
  }

  return body;
}
