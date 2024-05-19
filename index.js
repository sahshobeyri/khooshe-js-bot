console.log("HELLLLLO")
require('dotenv')

const { Telegraf, Markup} = require('telegraf')
const { message } = require('telegraf/filters')

const { BOT_TOKEN } = process.env;
if (!BOT_TOKEN) throw new Error('"BOT_TOKEN" env var is required!');

const WELCOME_MSG = "به خوشه خوش آمدید. 🍇"
const HELP_MSG = "برای یادگیری حبه به حبه، جای درستی رو انتخاب کردید."
const SELECT_LESSON_MSG = "لطفا درس مورد نظرتون رو انتخاب کنید."

const LESSONS = [
  {title: "مکانیک کوانتوم"},
  {title: "اصول رهبری و مذاکره"},
  {title: "نحو عربی"},
];

function generate_lessons_list(){
  let result = ""
  for (const idx in LESSONS) {
    result += `${+idx + 1}. ${LESSONS[idx].title}` + "\n"
  }
  return result
}

const keyboard = Markup.inlineKeyboard([
  Markup.button.url("❤️", "http://telegraf.js.org"),
  Markup.button.callback("Delete", "delete"),
]);

const bot = new Telegraf(BOT_TOKEN)
bot.start((ctx) => ctx.reply(WELCOME_MSG))
bot.help((ctx) => ctx.reply(HELP_MSG))
bot.command('select_lesson',(ctx) => {
  ctx.reply(SELECT_LESSON_MSG)
  ctx.reply(generate_lessons_list())
})
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
bot.command('debug',(ctx) => console.log(ctx))

bot.on("message", ctx => ctx.copyMessage(ctx.message.chat.id, keyboard));
bot.action("delete", ctx => ctx.deleteMessage());

bot.action('option1', (ctx) => ctx.reply('شما گزینه 1 را انتخاب کردید.'));
bot.action('option2', (ctx) => ctx.reply('شما گزینه 2 را انتخاب کردید.'));

bot.launch().then();


// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))


// bot.on(message('sticker'), (ctx) => ctx.reply('🖕🏻'))
// bot.on(message('text'),  (ctx) => {
//   if (ctx.message.text !== "start") {
//     ctx.reply('🤌🏻')
//   }
// });
// bot.hears('hi', (ctx) => ctx.reply('Hey there'))
// bot.launch().then()

//ctx.reply(`Hello ${ctx.update.message.from.first_name}!`)