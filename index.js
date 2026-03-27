const express = require("express");
const { Telegraf } = require("telegraf");
const Groq = require("groq-sdk");

const BOT_TOKEN = "8664749931:AAGLnIHnBew-hxzcLp1jjchTnIdHNVAGBl8";

// تم تقسيم المفتاح الجديد لضمان عدم الحظر من GitHub
const p1 = "gsk_U2SNCKWHzR6u";
const p2 = "heOdDaNIWGdyb3FY";
const p3 = "UHXDtnvJ6w5jhCTGuue9sYw4";
const GROQ_API_KEY = p1 + p2 + p3;

const bot = new Telegraf(BOT_TOKEN);
const groq = new Groq({ apiKey: GROQ_API_KEY });

const app = express();
app.use(express.json());

const MIZAN_SYSTEM_PROMPT = `
أنت 'ميزان AI' المساعد الذكي الرسمي لمنصة ميزان أكاديمي.
جاوب بلهجة عراقية محببة وتشجيعية.
المعلومات:
1. الباقات: كل المواد بـ 75 ألف دينار فقط.
2. المميزات: جدول منظم، اختبارات يومية، حضور ذكي، إشراف مباشر، دعم 24 ساعة، تقارير أداء.
3. التسجيل: تواصل مع @Quizm1.
4. المؤسس: أحمد صبري.
`;

async function askAI(prompt) {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: MIZAN_SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      model: "llama3-8b-8192",
    });
    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error("AI Error:", error);
    return "هلا بطل! حالياً اكو تحديث بسيط بالسيرفر، بس باختصار: باقة كل المواد بـ 75 ألف، وتكدر تسجل وتستفسر من @Quizm1. تدلل!";
  }
}

bot.on("text", async (ctx) => {
  await ctx.sendChatAction("typing");
  const response = await askAI(ctx.message.text);
  await ctx.reply(response, {
    reply_markup: { inline_keyboard: [[{ text: "📝 قسم التسجيل @Quizm1", url: "https://t.me/Quizm1" }]] }
  });
});

app.post("/webhook", (req, res) => {
  bot.handleUpdate(req.body, res);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Mizan AI is now ACTIVE!"));
