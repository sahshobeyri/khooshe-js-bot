console.log("HELLLLLO")
require('dotenv')

// const TeleBot = require('telebot');
const TeleBot = require('node-telegram-bot-api');
const bot = new TeleBot(process.env.BOT_TOKEN);

// bot.on('/start', (msg) => msg.reply.text('Welcome!'));
// bot.on('text', (msg) => msg.reply.text("Hello, so you said " + msg.text));
//
// bot.on(/(show\s)?kitty*/, (msg) => {
//   return msg.reply.photo('http://thecatapi.com/api/images/get');
// });

// Listen to /start command
bot.onText(/\/btn/, (msg) => {
  bot.sendMessage(msg.chat.id, 'لطفا یک گزینه را انتخاب کنید:', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'گزینه 1', callback_data: 'option1' },
          { text: 'گزینه 2', callback_data: 'option2' }
        ]
      ]
    }
  });
});

// Handle button click
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  bot.sendMessage(chatId, `شما گزینه "${data}" را انتخاب کردید.`);
});


bot.start();