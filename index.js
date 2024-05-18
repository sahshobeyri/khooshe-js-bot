console.log("HELLLLLO")
require('dotenv')

const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on(message('sticker'), (ctx) => ctx.reply('🖕🏻'))
// bot.on(message('text'),  (ctx) => ctx.reply('🤌🏻'))
// bot.hears('hi', (ctx) => ctx.reply('Hey there'))
// bot.launch().then()

bot.command('select',(ctx) => ctx.reply('سلام! لطفا یکی از گزینه‌ها را انتخاب کنید.', {
  reply_markup: {
    inline_keyboard: [
      [
        { text: 'گزینه 1', callback_data: 'option1' },
        { text: 'گزینه 2', callback_data: 'option2' }
      ]
    ]
  }
}));

bot.command('quiz', (ctx) => {
  ctx.replyWithQuiz(
    'Do you Like Me? Do you do you?', // متن سوال
    ['YES','NO'], // گزینه های سوال
    {
      correct_option_id: 0, // گزینه صحیح (شروع از 0)
      is_anonymous: false, // اگر می‌خواهید نتیجه کوئیز ناشناس باشد، این گزینه را برابر true قرار دهید
      explanation: 'I Like You too' // توضیحات پاسخ صحیح (دلخواه)
    }
  );
});

bot.action('option1', (ctx) => ctx.reply('شما گزینه 1 را انتخاب کردید.'));
bot.action('option2', (ctx) => ctx.reply('شما گزینه 2 را انتخاب کردید.'));

bot.launch().then();


// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))