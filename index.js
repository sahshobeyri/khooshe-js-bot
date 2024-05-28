console.log("HELLLLLO")
require('dotenv')
const LESSONS = require('./lessons_data.js')
const {Telegraf, Markup} = require('telegraf')
const fs = require('fs');
const {message} = require('telegraf/filters')

const { Client } = require('pg');

const dbClient = new Client({
  user: 'postgres',
  host: '3f9ecbb8-c469-4765-88e5-fec38cc7de07.hsvc.ir',
  database: 'postgres',
  password: process.env.DB_PASS,
  port: 32330,
});

dbClient.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err))
  // .finally(() => dbClient.end());


const {BOT_TOKEN} = process.env;
if (!BOT_TOKEN) throw new Error('"BOT_TOKEN" env var is required!');

const WELCOME_MSG = "به خوشه خوش آمدید. 🍇"
const HELP_MSG = "برای یادگیری حبه به حبه، جای درستی رو انتخاب کردید."
const SELECT_LESSON_MSG = "لطفا درس مورد نظرتون رو انتخاب کنید."

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

const db_init_user = (user_id, chat_id, username, first_name, last_name) => {
  const insertQuery =
    'INSERT INTO users (user_id,chat_id,username,first_name,last_name) VALUES ($1,$2,$3,$4,$5)';
  const values = [user_id, chat_id, username, first_name, last_name];
  dbClient.query(insertQuery, values).then(console.log).catch(console.log)
}

const check_if_user_exists = async (user_id) => {
  try {
    const query = 'SELECT * FROM users WHERE user_id = $1';
    const result = await dbClient.query(query, [user_id]);
    return result.rows.length > 0;
  } catch (err) {
    console.error('Error during database query:', err);
    return false;
  }
}

const register_user_if_not_exist = async (ctx) => {
  if (await check_if_user_exists(ctx.from.id)) return
  db_init_user(
    ctx.from.id,
    ctx.chat.id,
    ctx.from.username,
    ctx.from.first_name,
    ctx.from.last_name);
}

const keyboard = Markup.inlineKeyboard([
  Markup.button.url("❤️", "http://telegraf.js.org"),
  Markup.button.callback("Delete", "delete"),
]);

const lessonSelectionKeyboard =
  Markup.inlineKeyboard(LESSONS.map(l=>
    Markup.button.callback(`${l.title}`, `load-lesson-${l.id}`))
  );

const lessonSlideKeyboard = (l,slideIdx) => {
  let btn_arr = []
  if (slideIdx > 0) {
    btn_arr.push(Markup.button.callback("اسلاید قبل", `load-lesson-${l.id}-slide-${slideIdx - 1}`))
  }
  if (slideIdx < l.length - 1) {
    btn_arr.push(Markup.button.callback("اسلاید بعد", `load-lesson-${l.id}-slide-${slideIdx + 1}`))
  }else {
    btn_arr.push(Markup.button.callback("پایان درس", `finish-lesson-${l.id}`))
  }
  return Markup.inlineKeyboard(btn_arr);
}

const lessonFinishKeyboard = (l) =>
  Markup.inlineKeyboard([
    Markup.button.callback("از اول", `start-lesson-${l.id}`),
    Markup.button.callback("کوئیز", `quiz-lesson-${l.id}`),
    Markup.button.callback("لیست درس ها", "load-lessons"),
  ]);

const lessonQuizKeyboard = (l) =>
  Markup.inlineKeyboard([
    Markup.button.callback("دوباره بخونمش", `start-lesson-${l.id}`),
    Markup.button.callback("لیست درس ها", "load-lessons"),
  ]);

const lessonIntroKeyboard = (l) =>
  Markup.inlineKeyboard([
    Markup.button.callback("شروع درس", `start-lesson-${l.id}`),
    Markup.button.callback("بازگشت", "load-lessons"),
  ]);

const selectLessonsPage = (ctx) =>
  ctx.reply(SELECT_LESSON_MSG,lessonSelectionKeyboard);

const lessonIntroPage = (ctx, lesson) => {
  const photoPath = `img/lessons/l${lesson.id}/intro.PNG`;
  try {
    const photoStream = fs.createReadStream(photoPath);
    return ctx.replyWithPhoto(
      { source: photoStream },
      {
        caption: `شما درس ${lesson.title} را انتخاب کردید`,
        ...lessonIntroKeyboard(lesson),
      },
    );
  } catch (err) {
    console.log(err);
    return ctx.reply('مشکلی در ارسال تصویر به وجود آمده است.');
  }
}

const lessonSlidePage = (ctx, lesson, slideIdx, initial = false) => {
  const photoPath = `img/lessons/l${lesson.id}/s${slideIdx}.PNG`;
  if (initial) {
    try {
      const photoStream = fs.createReadStream(photoPath);
      return ctx.replyWithPhoto(
        { source: photoStream },
        lessonSlideKeyboard(lesson,slideIdx)
      );
    } catch (err) {
      console.log(err);
      return ctx.reply('مشکلی در ارسال تصویر به وجود آمده است.');
    }
  }else {
    try {
      const photoStream = fs.createReadStream(photoPath);
      return ctx.editMessageMedia({
        type: 'photo',
        media: { source: photoStream }
        },
        lessonSlideKeyboard(lesson,slideIdx)
      );
    } catch (err) {
      console.log(err);
      return ctx.reply('مشکلی در ارسال تصویر به وجود آمده است.');
    }
  }
}

const lessonFinishPage = (ctx, lesson) => {
  const photoPath = `img/lessons/lessonFinished.PNG`;
  try {
    const photoStream = fs.createReadStream(photoPath);
    return ctx.replyWithPhoto(
      { source: photoStream },
      lessonFinishKeyboard(lesson)
    );
  } catch (err) {
    console.log(err);
    return ctx.reply('مشکلی در ارسال تصویر به وجود آمده است.');
  }
}

const lessonQuizPage = async (ctx, lesson) => {
  const q = lesson.quiz
  await ctx.replyWithQuiz(
    q.question, // متن سوال
    q.options, // گزینه های سوال
    {
      correct_option_id: q.correct, // گزینه صحیح (شروع از 0)
      is_anonymous: false, // اگر می‌خواهید نتیجه کوئیز ناشناس باشد، این گزینه را برابر true قرار دهید
      explanation: q.explain // توضیحات پاسخ صحیح (دلخواه)
    },
  );
  await ctx.reply('بعد از این کجا میرید؟',lessonQuizKeyboard(lesson))
}

const bot = new Telegraf(BOT_TOKEN)
bot.start((ctx) => {
  ctx.reply(WELCOME_MSG)
})
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
bot.command('image', (ctx) => {
  const photoPath = 'img/genie5.PNG';
  try {
    const photoStream = fs.createReadStream(photoPath);
    return ctx.replyWithPhoto({ source: photoStream });
  } catch (err) {
    console.log(err);
    return ctx.reply('مشکلی در ارسال تصویر به وجود آمده است.');
  }
});
bot.command('register', async (ctx) =>{
  await register_user_if_not_exist(ctx)
  // const userId = ctx.from.id;
  // const chatId = ctx.chat.id;
  // const username = ctx.from.username;
  // const firstName = ctx.from.first_name;
  // const lastName = ctx.from.last_name;
  // db_init_user(userId,chatId,username,firstName,lastName)
});
bot.command('db_debug', async (ctx) => {
  await ctx.reply('nothing for now')
  // await ctx.reply('started altering db')
  // const insertQuery = 'INSERT INTO users (chat_id,username,race) VALUES ($1,$2,$3)';
  // const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)]
  // const chat_id = Math.round(Math.random() * 10000)
  // const username = randomPick(['qoli','hassan','mammad'])
  // const race = randomPick(['asian','american','african'])
  // const values = [chat_id,username,race];
  //
  // dbClient.query(insertQuery, values)
  //   .then(res => {
  //     console.log('User added successfully:', res.toString());
  //   })
  //   .catch(err => {
  //     console.error('Error adding user:', err);
  //   });
});

// bot.on("message", ctx => ctx.copyMessage(ctx.message.chat.id, keyboard));
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
  lessonSlidePage(ctx, lesson, 0, true)
});

bot.action(/^finish-lesson-(\d+)$/, (ctx) => {
  ctx.deleteMessage()
  const lesson = getLesson(+(ctx.match[1]))
  lessonFinishPage(ctx, lesson)
});

bot.action(/^quiz-lesson-(\d+)$/, (ctx) => {
  ctx.deleteMessage()
  const lesson = getLesson(+(ctx.match[1]))
  lessonQuizPage(ctx, lesson)
});

bot.action(/^load-lesson-(\d+)-slide-(\d+)$/, (ctx) => {
  // ctx.deleteMessage()
  const lesson = getLesson(+(ctx.match[1]))
  lessonSlidePage(ctx, lesson, +(ctx.match[2]))
});

bot.action("load-lessons", (ctx) => {
  ctx.deleteMessage()
  selectLessonsPage(ctx)
});

bot.launch().then();


// Enable graceful stop
process.once('SIGINT', () => {
  dbClient.end()
  bot.stop('SIGINT')
});
process.once('SIGTERM', () => {
  dbClient.end()
  bot.stop('SIGTERM')
});