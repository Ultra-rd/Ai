// Убедись, что ты используешь Node.js версии 18+
// Чтобы импорт работал, добавь в package.json: { "type": "module" }

import TelegramBot from "node-telegram-bot-api";
import Together from "together-ai";

// 🔑 Твои токены (вставь свои рабочие ключи):
const TELEGRAM_TOKEN = "7575182675:AAGV7EDv_H__4anCKbpAuHPQdQY9aLpDKW0";
const TOGETHER_API_KEY = "f788a4cb56c2084ca59e31702e952ff40d4d761bc8b25cb4a026ed0d00bbe9af";

// Инициализация бота и ИИ
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Инициализация Together API
const together = new Together({ apiKey: TOGETHER_API_KEY });

// Память пользователей (временная, сбрасывается при перезапуске)
const conversations = {};

// Обработка входящих сообщений
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userInput = msg.text;

  if (!userInput) return;

  // Инициализация истории для пользователя, если её ещё нет
  if (!conversations[chatId]) {
    conversations[chatId] = [];
  }

  // Добавляем сообщение пользователя в историю
  conversations[chatId].push({ role: 'user', content: userInput });

  try {
    // Отправляем запрос к Together API
    const response = await together.chat.completions.create({
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      messages: conversations[chatId],
    });

    const botReply = response.choices[0].message.content.trim();

    // Добавляем ответ бота в историю
    conversations[chatId].push({ role: 'assistant', content: botReply });

    // Отправляем ответ пользователю
    bot.sendMessage(chatId, botReply);
  } catch (err) {
    console.error('Ошибка при обращении к Together:', err);
    bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте позже.');
  }
});