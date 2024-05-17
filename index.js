console.log("HELLLLLO")

const TeleBot = require('telebot');
const bot = new TeleBot("5163059849:AAFb7D1wmX9LJicdJ6nPUfQ0O3WMjZIxffY");

bot.on('text', (msg) => msg.reply.text("Hello" + msg.text));

bot.start();