console.log("HELLLLLO")

const TeleBot = require('telebot');
const bot = new TeleBot("5163059849:AAE6Mm-ob0BqB1QxQIZZxFeMYRo5Mn9-zPg");

bot.on('/start', (msg) => msg.reply.text('Welcome!'));
bot.on('text', (msg) => msg.reply.text("Hello " + msg.text));

bot.start();