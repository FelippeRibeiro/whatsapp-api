import { AnyMessageContent, downloadMediaMessage, proto } from '@whiskeysockets/baileys';
import { getMessageBody } from './getBodyMessage';

export async function convertIWebMessageInfoToAnyMessageContent(message: proto.IWebMessageInfo): Promise<AnyMessageContent> {
  const text = getMessageBody(message.message!);
  const {
    audioMessage,
    imageMessage,
    stickerMessage,
    documentMessage,
    documentWithCaptionMessage,
    conversation,
    extendedTextMessage,
    contactMessage,
    contactsArrayMessage,
    locationMessage,
    messageContextInfo,
    videoMessage,
  } = message.message!;

  if (audioMessage || imageMessage || videoMessage || stickerMessage || documentMessage || documentWithCaptionMessage) {
    const midia = (await downloadMediaMessage(message, 'buffer', {})) as Buffer;
    if (audioMessage) return { audio: midia };
    if (imageMessage) return { image: midia, caption: text };
    if (videoMessage) return { video: midia, caption: text };
    if (stickerMessage) return { sticker: midia };
    if (documentMessage) return { document: midia, mimetype: documentMessage.mimetype!, fileName: documentMessage.fileName!, caption: text };
    if (documentWithCaptionMessage)
      return {
        document: midia,
        mimetype: documentWithCaptionMessage.message?.documentMessage!.mimetype!,
        fileName: documentWithCaptionMessage.message?.documentMessage!.fileName!,
        caption: documentWithCaptionMessage.message?.documentMessage!.caption!,
      };
  }
  if (locationMessage) return { location: locationMessage };
  if (contactMessage) return { contacts: { contacts: [contactMessage] } };
  if (contactsArrayMessage) return { contacts: { displayName: contactsArrayMessage.displayName!, contacts: contactsArrayMessage.contacts! } };
  if (conversation || extendedTextMessage || messageContextInfo) return { text };

  return { text };
}
