console.log("HELLLLLO")
require('dotenv')

const TeleBot = require('telebot');
const bot = new TeleBot(process.env.BOT_TOKEN);

bot.on('/start', (msg) => msg.reply.text('Welcome!'));
bot.on('text', (msg) => msg.reply.text("Hello, so you said " + msg.text));

bot.on(/(show\s)?kitty*/, (msg) => {
  return msg.reply.photo('http://thecatapi.com/api/images/get');
});

bot.on('/btn', (msg) => {
  msg.reply.text('لطفا یک گزینه را انتخاب کنید:', {
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


bot.start();