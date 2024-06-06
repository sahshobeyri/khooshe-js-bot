console.log("HELLLLLO")
require('dotenv')
const BOT_ADDRESS = "https://t.me/khooshe_dev_bot"
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
// const HELP_MSG = "برای یادگیری حبه به حبه، جای درستی رو انتخاب کردید."
const HELP_MSG = `🍇 خوشه، جایی برای یادگیری حبه‌حبه است.

🤌🏻 درسنامه‌های ساده،
🖼 با بهره‌گیری از قصه‌گویی و تصویرسازی،
🍕 تفکیک شده به لقمه‌های کوچیک،
📚 موضوعات مختلف و متنوع،
⭐️ با کیفیت، پولیش‌شده و معتبر.

💡وقت ندارید یه کتاب رو بخونید؟ ما لب مطلبش رو براتون میگیم.

💍 دوست دارید 80 درصد مهم یک مطلب رو توی 20 درصد زمان یاد بگیرید؟ جای درستی اومدید.

💎 با استفاده از دستور /select_lesson میتونید یکی از درسنامه ها رو انتخاب کنید، و یادگیری حبه‌حبه رو شروع کنید!`
const SELECT_LESSON_MSG = "لطفا درس مورد نظرتون رو انتخاب کنید."

function getLesson(id) {
  return LESSONS.find(l => l.id === id)
}

function generateLessonsList() {
  let result = ""
  for (const l of LESSONS) {
    // const link = `[${LESSONS[idx].title}](${BOT_ADDRESS}?start=/lesson-${idx})`;
    // result += `${+idx + 1}. ${link}:` + "\n"
    result += `*${+l.id + 1}. ${l.title}*:`+ "\n"
    result += `${l.description}` + "\n"
    result += "(شروع درس:" + `/LessonCode${l.id})` + "\n\n"
  }
  return result
}

const db_init_user = (user_id, chat_id, username, first_name, last_name) => {
  const insertQuery =
    'INSERT INTO users (user_id,chat_id,username,first_name,last_name,first_seen,last_seen) VALUES ($1,$2,$3,$4,$5,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)';
  const values = [user_id, chat_id, username, first_name, last_name];
  dbClient.query(insertQuery, values).then(console.log).catch(console.log)
}

const db_update_last_seen = (user_id) => {
  const update_query = `UPDATE users
  SET last_seen = CURRENT_TIMESTAMP
  WHERE user_id = $1;`
  const values = [user_id]
  dbClient.query(update_query,values).then(console.log).catch(console.log)
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

const on_any_interaction = async (ctx) => {
  await register_user_if_not_exist(ctx)
  db_update_last_seen(ctx.from.id)
}

const lessonSelectionKeyboardV1 =
  Markup.inlineKeyboard(LESSONS.map(l=>
    Markup.button.callback(`${l.title}`, `load-lesson-${l.id}`))
  );

const lessonSelectionKeyboardV2 =
  Markup.inlineKeyboard(LESSONS.map(l=>
    Markup.button.callback(`${l.title}`, `load-lesson-${l.id}`))
    .map(i => [i])
  );

const lessonSelectionKeyboard =
  Markup.inlineKeyboard([
    Markup.button.callback("بستن", "close-page"),
  ]);

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

const selectLessonsPage = async (ctx) => {
  await on_any_interaction(ctx)
  const replyText = SELECT_LESSON_MSG + "\n\n" + generateLessonsList()
  ctx.replyWithMarkdown(replyText,lessonSelectionKeyboard);
}

const lessonIntroPage = async (ctx, lesson) => {
  await on_any_interaction(ctx)
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

const lessonSlidePage = async (ctx, lesson, slideIdx, initial = false) => {
  await on_any_interaction(ctx)
  const photoPath = `img/lessons/l${lesson.id}/s${slideIdx+1}.PNG`;
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

const lessonFinishPage = async (ctx, lesson) => {
  await on_any_interaction(ctx)
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
  await on_any_interaction(ctx)
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

const statsPage = async (ctx) => {
  await on_any_interaction(ctx)
  const user_id = ctx.from.id
  dbClient.query('SELECT EXTRACT(EPOCH FROM (last_seen - first_seen)) AS time_diff FROM users WHERE user_id = $1',
    [user_id], (err, res) => {
      if (err) {
        console.error('خطا در اجرای کوئری', err);
        return;
      }
      const timeDiffInSeconds = res.rows[0].time_diff;
      const timeDiffInHours = (timeDiffInSeconds/3600).toFixed(1)
      ctx.reply(`⏱ You have been here from ${timeDiffInHours} hours ago.`)
    });
}

const helpPage = async (ctx) => {
  await on_any_interaction(ctx)
  ctx.reply(HELP_MSG)
}

const startPage = async (ctx) => {
  await on_any_interaction(ctx)
  ctx.reply(WELCOME_MSG)
}

const bot = new Telegraf(BOT_TOKEN)


bot.start(startPage);
bot.help(helpPage);
bot.command('select_lesson', selectLessonsPage)
bot.command('stats', statsPage)

bot.hears(/\/LessonCode(\d+)/, async (ctx) => {
  await on_any_interaction(ctx)
  // ctx.deleteMessage()
  const lesson = getLesson(+(ctx.match[1]))
  await lessonIntroPage(ctx, lesson)
});

bot.action(/^load-lesson-(\d+)$/, async (ctx) => {
  await on_any_interaction(ctx)
  ctx.deleteMessage()
  const lesson = getLesson(+(ctx.match[1]))
  await lessonIntroPage(ctx, lesson)
});

bot.action(/^start-lesson-(\d+)$/, async (ctx) => {
  await on_any_interaction(ctx)
  ctx.deleteMessage()
  const lesson = getLesson(+(ctx.match[1]))
  await lessonSlidePage(ctx, lesson, 0, true)
});

bot.action(/^finish-lesson-(\d+)$/, async (ctx) => {
  await on_any_interaction(ctx)
  ctx.deleteMessage()
  const lesson = getLesson(+(ctx.match[1]))
  await lessonFinishPage(ctx, lesson)
});

bot.action(/^quiz-lesson-(\d+)$/, async (ctx) => {
  await on_any_interaction(ctx)
  ctx.deleteMessage()
  const lesson = getLesson(+(ctx.match[1]))
  await lessonQuizPage(ctx, lesson)
});

bot.action(/^load-lesson-(\d+)-slide-(\d+)$/, async (ctx) => {
  await on_any_interaction(ctx)
  const lesson = getLesson(+(ctx.match[1]))
  await lessonSlidePage(ctx, lesson, +(ctx.match[2]))
});

bot.action("load-lessons", async (ctx) => {
  await on_any_interaction(ctx)
  ctx.deleteMessage()
  await selectLessonsPage(ctx)
});

bot.action("close-page", async (ctx) => {
  await on_any_interaction(ctx)
  ctx.deleteMessage()
})

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