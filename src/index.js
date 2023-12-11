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

export default {
  async email(event, env, ctx) {
    // environments must be configured in Cloudflare
    const BOT_TOKEN = env.BOT_TOKEN;
    const CHAT_ID = env.CHAT_ID;

    const rawEmail = await streamToArrayBuffer(event.raw, event.rawSize);
    const parser = new PostalMime.default();
    const parsedEmail = await parser.parse(rawEmail);
    let text = `Subject: ${message.headers.get('subject')}\nFrom: ${message.from}\nTo: ${message.to}\n`
    if (parsedEmail.attachments.length == 0) {
      text += "No attachments\n";
    } else {
      parsedEmail.attachments.forEach((att) => {
        text += `Attachment: ${att.filename}, disp: ${att.disposition}, mime: ${att.mimeType}, size: ${att.content.byteLength}\n`;
      });
    }
    text += `\n${parsedEmail.text}`;
    const data = new URLSearchParams({
      chat_id: CHAT_ID, 
      text: text.slice(0, 4096)
    });
    let r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {body: data, method: 'POST'});
    console.log(await r.text());
    const data = new FormData();
    data.append("chat_id", CHAT_ID);
    data.append("document", new File(rawEmail, "message.eml"));
    let r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {body: data, method: 'POST'});
    console.log(await r.text());
  },
};
