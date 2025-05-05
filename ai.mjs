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
const PROMPT_HEADER = `Ты - Алиса, профессиональный и очень опытный гид по Туркестанской области. 
Твоя задача — предоставлять исчерпывающую и интересную информацию о регионе. Отвечай на вопросы так, как это сделал бы знающий и увлечённый своим делом гид. 
Сосредоточься исключительно на темах, связанных с Туркестанской областью: история, культура, достопримечательности, природа, традиции, маршруты, полезная информация для туристов. 
Игнорируй любые вопросы и темы, не имеющие отношения к Туркестанской области, вежливо напоминая, что ты специализируешься именно на этом регионе. 
Используй профессиональную лексику гида, но старайся быть понятной и увлекательной для слушателей.\n`;

const chatHistories = {};

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  // Инициализируем историю, если нет
  if (!chatHistories[chatId]) {
    chatHistories[chatId] = [];
  }

  // Добавляем сообщение пользователя в историю
  chatHistories[chatId].push({ role: 'user', content: userMessage });

  // Ограничим историю 10 последними сообщениями
  if (chatHistories[chatId].length > 10) {
    chatHistories[chatId] = chatHistories[chatId].slice(-10);
  }

  // Формируем полный промпт
  const fullPrompt = PROMPT_HEADER + chatHistories[chatId]
    .map(msg => (msg.role === 'user' ? `Пользователь: ${msg.content}` : `Алиса: ${msg.content}`))
    .join('\n') + `\nАлиса:`;

  try {
    const response = await together.chat.completions.create({
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      messages: [
        { role: 'system', content: PROMPT_HEADER },
        ...chatHistories[chatId]
      ],
      temperature: 0.7,
    });

    const botReply = response.choices[0]?.message?.content?.trim() || 'Извините, возникла ошибка при получении ответа.';

    // Сохраняем ответ Алисы в историю
    chatHistories[chatId].push({ role: 'assistant', content: botReply });

    bot.sendMessage(chatId, botReply);
  } catch (err) {
    console.error('Ошибка запроса в Together AI:', err);
    bot.sendMessage(chatId, 'Произошла ошибка при обращении к ИИ. Попробуйте позже.');
  }
});