// Убедись, что ты используешь Node.js версии 18+
// Чтобы импорт работал, добавь в package.json: { "type": "module" }

import TelegramBot from "node-telegram-bot-api";
import Together from "together-ai";

// 🔑 Твои токены (вставь свои рабочие ключи):
const TELEGRAM_TOKEN = "7575182675:AAGV7EDv_H__4anCKbpAuHPQdQY9aLpDKW0";
const TOGETHER_API_KEY = "f788a4cb56c2084ca59e31702e952ff40d4d761bc8b25cb4a026ed0d00bbe9af";

// Инициализация бота и ИИ
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const together = new Together({ apiKey: TOGETHER_API_KEY });

console.log("🧠 Бот-психолог Кристина запущен...");

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userInput = msg.text;

  console.log("📩 Получено сообщение:", userInput);

  bot.sendChatAction(chatId, "typing");

  try {
    const response = await together.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Ты — профессиональный психолог по имени Кристина. Ты говоришь спокойно, доброжелательно, с пониманием и поддержкой. Помогаешь людям справляться с тревогой, стрессом, апатией, проблемами в отношениях и самооценкой. Отвечай так, будто ты ведешь приватную терапевтическую беседу."
        },
        {
          role: "user",
          content: userInput
        }
      ],
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"
    });

    const reply = response.choices[0].message.content;
    console.log("🤖 Кристина ответила:", reply);

    bot.sendMessage(chatId, reply);
  } catch (error) {
    console.error("❌ Ошибка:", error);
    bot.sendMessage(chatId, "⚠️ Произошла ошибка. Попробуйте позже.");
  }
});