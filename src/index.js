import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";

const PostalMime = require("postal-mime");

async function streamToArrayBuffer(stream, streamSize) {
  let result = new Uint8Array(streamSize);
  let bytesRead = 0;
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    result.set(value, bytesRead);
    bytesRead += value.length;
  }
  return result;
}

async function sendDocument(bot_token, chat_id, buffer, filename, caption) {
  const data = new FormData();
  data.append("chat_id", chat_id);
  data.append("document", new Blob([buffer]), filename);
  data.append("caption", caption.slice(0, 1023);
  console.log("-> sendDocument", chat_id, filename);
  let r = await fetch(`https://api.telegram.org/bot${bot_token}/sendDocument`, {body: data, method: 'POST'});
  console.log("<-", await r.text());
}

export default {
  async email(event, env, ctx) {
    // environments must be configured in Cloudflare
    const BOT_TOKEN = env.BOT_TOKEN;
    const CHAT_ID = env.CHAT_ID;

    const rawEmail = await streamToArrayBuffer(event.raw, event.rawSize);
    const parser = new PostalMime.default();
    const parsedEmail = await parser.parse(rawEmail);
    let text = `Subject: ${parsedEmail.subject}\nFrom: ${event.from}\nTo: ${event.to}\n`
    if (parsedEmail.attachments.length == 0) {
      text += "No attachments\n";
    } else {
      parsedEmail.attachments.forEach((att) => {
        text += `Attachment: ${att.filename}, disp: ${att.disposition}, mime: ${att.mimeType}, size: ${att.content.byteLength}\n`;
      });
    }
    text += `\n${parsedEmail.text}`;
    
    await sendDocument(BOT_TOKEN, CHAT_ID, rawEmail, new Date().toJSON() + ".eml", text);
  },
};
