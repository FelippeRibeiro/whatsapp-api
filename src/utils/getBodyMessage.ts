import { proto } from '@whiskeysockets/baileys';

export function getMessageBody(message: proto.IMessage): string {
    let body = '';

    if ('conversation' in message) body = message.conversation ?? '';

    if ('extendedTextMessage' in message && !body) body = message.extendedTextMessage?.text ?? '';

    if ('imageMessage' in message && !body) body = message.imageMessage?.caption ?? '';

    if ('videoMessage' in message && !body) body = message.videoMessage?.caption ?? '';

    if ('documentMessage' in message && !body) body = message.documentMessage?.caption ?? '';

    if ('buttonsResponseMessage' in message && !body) body = message.buttonsResponseMessage?.selectedButtonId ?? '';

    if ('listResponseMessage' in message && !body) body = message.listResponseMessage?.singleSelectReply?.selectedRowId ?? '';

    if ('templateButtonReplyMessage' in message && !body) body = message.templateButtonReplyMessage?.selectedId ?? '';

    if ('messageContextInfo' in message && !body)
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
            message.extendedTextMessage?.text ||
            '';

    if ('viewOnceMessage' in message && !body) body = message.viewOnceMessage?.message?.imageMessage?.caption || message.viewOnceMessage?.message?.videoMessage?.caption || '';

    if ('viewOnceMessageV2' in message && !body) body = message.viewOnceMessageV2?.message?.imageMessage?.caption || message.viewOnceMessageV2?.message?.videoMessage?.caption || '';

    if ('viewOnceMessageV2Extension' in message && !body) body = message.viewOnceMessageV2Extension?.message?.imageMessage?.caption || message.viewOnceMessageV2Extension?.message?.videoMessage?.caption || '';

    return body;
}

// import { MessageType, proto } from '@whiskeysockets/baileys';

// export function getMessageBody(message: proto.IMessage): string {
//      // Checa se algum tipo de mensagem foi enviado e usa o primeiro tipo encontrado.
//      const messageType = Object.keys(message)[0] as MessageType;

//      let body = '';
//      switch (messageType) {
//           case 'conversation':
//                body = message.conversation ?? '';
//                break;
//           case 'extendedTextMessage':
//                body = message.extendedTextMessage?.text ?? '';
//                break;
//           case 'imageMessage':
//                body = message.imageMessage?.caption ?? '';
//                break;
//           case 'videoMessage':
//                body = message.videoMessage?.caption ?? '';
//                break;
//           case 'documentMessage':
//                body = message.documentMessage?.caption ?? '';
//                break;
//           case 'buttonsResponseMessage':
//                body = message.buttonsResponseMessage?.selectedButtonId ?? '';
//                break;
//           case 'listResponseMessage':
//                body = message.listResponseMessage?.singleSelectReply?.selectedRowId ?? '';
//                break;
//           case 'templateButtonReplyMessage':
//                body = message.templateButtonReplyMessage?.selectedId ?? '';
//                break;
//           case 'messageContextInfo':
//                // Captura de textos presentes em mensagens de contexto.
//                body =
//                     message.buttonsResponseMessage?.selectedButtonId ||
//                     message.listResponseMessage?.singleSelectReply?.selectedRowId ||
//                     message.conversation ||
//                     message.viewOnceMessage?.message?.imageMessage?.caption ||
//                     message.viewOnceMessage?.message?.videoMessage?.caption ||
//                     message.viewOnceMessageV2?.message?.videoMessage?.caption ||
//                     message.viewOnceMessageV2?.message?.imageMessage?.caption ||
//                     message.viewOnceMessageV2Extension?.message?.imageMessage?.caption ||
//                     message.viewOnceMessageV2Extension?.message?.videoMessage?.caption ||
//                     message.extendedTextMessage?.text ||
//                     '';
//                break;
//           // Caso para mensagens viewOnce, caso apareçam em outros tipos de mensagens.
//           case 'viewOnceMessage':
//                body = message.viewOnceMessage?.message?.imageMessage?.caption || message.viewOnceMessage?.message?.videoMessage?.caption || '';
//                break;
//           case 'viewOnceMessageV2':
//                body = message.viewOnceMessageV2?.message?.imageMessage?.caption || message.viewOnceMessageV2?.message?.videoMessage?.caption || '';
//                break;
//           case 'viewOnceMessageV2Extension':
//                body = message.viewOnceMessageV2Extension?.message?.imageMessage?.caption || message.viewOnceMessageV2Extension?.message?.videoMessage?.caption || '';
//                break;
//           // Adiciona casos adicionais se surgirem novos tipos de mensagem.
//           default:
//                body = '';
//                break;
//      }

//      return body;
// }
