console.log("HELLLLLO")

const TeleBot = require('telebot');
const bot = new TeleBot("5163059849:AAEbL-jSd79atSO996RGVIZlm3XP_IZC6mQ");

bot.on('text', (msg) => msg.reply.text(msg.text + msg.text));

bot.start();