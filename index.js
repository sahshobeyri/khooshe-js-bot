console.log("HELLLLLO")
require('dotenv')

const { Telegraf } = require('telegraf')
// const { message } = require('telegraf/filters')

const bot = new Telegraf(process.env.BOT_TOKEN)
// bot.start((ctx) => ctx.reply('Welcome'))
// bot.help((ctx) => ctx.reply('Send me a sticker'))
// bot.on(message('sticker'), (ctx) => ctx.reply('👍'))
// bot.hears('hi', (ctx) => ctx.reply('Hey there'))
// bot.launch().then()

// bot.start((ctx) => ctx.reply('سلام! لطفا یکی از گزینه‌ها را انتخاب کنید.', {
//   reply_markup: {
//     inline_keyboard: [
//       [
//         { text: 'گزینه 1', callback_data: 'option1' },
//         { text: 'گزینه 2', callback_data: 'option2' }
//       ]
//     ]
//   }
// }));
//
// bot.action('option1', (ctx) => ctx.reply('شما گزینه 1 را انتخاب کردید.'));
// bot.action('option2', (ctx) => ctx.reply('شما گزینه 2 را انتخاب کردید.'));

bot.start((ctx) => {
  return ctx.reply('لطفا گزینه مورد نظر خود را انتخاب کنید', Markup.keyboard([
    ['کباب', 'پیتزا']
  ]).oneTime()
    .resize()
    .extra());
});

bot.hears('کباب', (ctx) => {
  ctx.reply('شما گزینه کباب را انتخاب کردید.');
  ctx.reply('لطفا گزینه مورد نظر خود را انتخاب کنید', Markup.removeKeyboard().extra());
});

bot.hears('پیتزا', (ctx) => {
  ctx.reply('شما گزینه پیتزا را انتخاب کردید.');
  ctx.reply('لطفا گزینه مورد نظر خود را انتخاب کنید', Markup.removeKeyboard().extra());
});


bot.launch().then();


// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))