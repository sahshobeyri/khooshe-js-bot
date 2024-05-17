console.log("HELLLLLO")

const TeleBot = require('telebot');
const bot = new TeleBot("1209877287:AAHibo60qhKBqWaJVq6A-CzB4hDeSvMCGls");

bot.on('/start', (msg) => msg.reply.text('Welcome!'));
bot.on('text', (msg) => msg.reply.text("Hello, so you said " + msg.text));

bot.start();