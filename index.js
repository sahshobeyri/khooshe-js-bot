console.log("HELLLLLO")

const TeleBot = require('telebot');
const bot = new TeleBot(process.env.BOT_TOKEN);

bot.on('/start', (msg) => msg.reply.text('Welcome!'));
bot.on('text', (msg) => msg.reply.text("Hello, so you said " + msg.text));

bot.start();