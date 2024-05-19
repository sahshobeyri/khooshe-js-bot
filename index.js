console.log("HELLLLLO")
require('dotenv')

const {Telegraf, Markup} = require('telegraf')
const {message} = require('telegraf/filters')

const {BOT_TOKEN} = process.env;
if (!BOT_TOKEN) throw new Error('"BOT_TOKEN" env var is required!');

const WELCOME_MSG = "به خوشه خوش آمدید. 🍇"
const HELP_MSG = "برای یادگیری حبه به حبه، جای درستی رو انتخاب کردید."
const SELECT_LESSON_MSG = "لطفا درس مورد نظرتون رو انتخاب کنید."

const LESSONS = [
  {
    id:0,
    title: "مکانیک کوانتوم",
    frames: [
      "مکانیک کوانتوم، فریم اول",
      "مکانیک کوانتوم، فریم دوم",
      "مکانیک کوانتوم، فریم سوم",
    ]
  },
  {
    id:1,
    title: "اصول رهبری و مذاکره",
    frames: [
      "اصول رهبری و مذاکره، فریم اول",
      "اصول رهبری و مذاکره، فریم دوم",
      "اصول رهبری و مذاکره، فریم سوم",
    ]
  },
  {
    id:2,
    title: "نحو عربی",
    frames: [
      "نحو عربی، فریم اول",
      "نحو عربی، فریم دوم",
      "نحو عربی، فریم سوم",
      "نحو عربی، فریم چهارم",
    ]
  },
];

function getLesson(id) {
  return LESSONS.find(l => l.id === id)
}

function generateLessonsList() {
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

const lessonSelectionKeyboard =
  Markup.inlineKeyboard(LESSONS.map(l=>
    Markup.button.callback(`${l.title}`, `load-lesson-${l.id}`))
  );

const lessonIntroKeyboard = (l) =>
  Markup.inlineKeyboard([
    Markup.button.callback("شروع درس", `start-lesson-${l.id}`),
    Markup.button.callback("بازگشت", "load-lessons"),
  ]);

const selectLessonsPage = (ctx) =>
  ctx.reply(SELECT_LESSON_MSG,lessonSelectionKeyboard);

const lessonIntroPage = (ctx, lesson) =>
  ctx.reply(`شما درس ${lesson.title} را انتخاب کردید`, lessonIntroKeyboard(lesson))

const bot = new Telegraf(BOT_TOKEN)
bot.start((ctx) => ctx.reply(WELCOME_MSG))
bot.help((ctx) => ctx.reply(HELP_MSG))
bot.command('select_lesson', selectLessonsPage)
bot.command('select', (ctx) => ctx.reply('سلام! لطفا یکی از گزینه‌ها را انتخاب کنید.', {
  reply_markup: {
    inline_keyboard: [
      [
        {text: 'گزینه 1', callback_data: 'option-1'},
        {text: 'گزینه 2', callback_data: 'option-2'}
      ]
    ]
  }
}));
bot.command('quiz', (ctx) => {
  ctx.replyWithQuiz(
    'Do you Like Me? Do you do you?', // متن سوال
    ['YES', 'NO'], // گزینه های سوال
    {
      correct_option_id: 0, // گزینه صحیح (شروع از 0)
      is_anonymous: false, // اگر می‌خواهید نتیجه کوئیز ناشناس باشد، این گزینه را برابر true قرار دهید
      explanation: 'I Like You too' // توضیحات پاسخ صحیح (دلخواه)
    }
  );
});
bot.command('debug', (ctx) => console.log(ctx))

bot.on("message", ctx => ctx.copyMessage(ctx.message.chat.id, keyboard));
bot.action("delete", ctx => ctx.deleteMessage());

bot.action(/^option-(\d+)$/, (ctx) => {
  ctx.deleteMessage()
  ctx.reply(`شما گزینه ${ctx.match[1]} را انتخاب کردید`, keyboard)
});

bot.action(/^load-lesson-(\d+)$/, (ctx) => {
  ctx.deleteMessage()
  const lesson = getLesson(+(ctx.match[1]))
  lessonIntroPage(ctx, lesson)
});

bot.action(/^start-lesson-(\d+)$/, (ctx) => {
  ctx.deleteMessage()
  const lesson = getLesson(+(ctx.match[1]))
  lessonIntroPage(ctx, lesson)
});

bot.action("load-lessons", (ctx) => {
  ctx.deleteMessage()
  selectLessonsPage(ctx)
});

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
// just to deploy