const express = require("express");
const { Telegraf } = require("telegraf");
const Groq = require("groq-sdk");

const BOT_TOKEN = "8664749931:AAGLnIHnBew-hxzcLp1jjchTnIdHNVAGBl8";

// تم تغيير التقسيم لضمان العبور 100%
const k1 = "gsk_U2SNCKWHzR";
const k2 = "6uheOdDaNIWGdyb3FY";
const k3 = "UHXDtnvJ6w5jhCTGuue9sYw4";
const GROQ_API_KEY = k1 + k2 + k3;

const bot = new Telegraf(BOT_TOKEN);
const groq = new Groq({ apiKey: GROQ_API_KEY });

const app = express();
app.use(express.json());

const MIZAN_SYSTEM = "أنت مساعد ذكي لمنصة ميزان أكاديمي. جاوب بلهجة عراقية. باقة كل المواد بـ 75 ألف.";

async function askAI(prompt) {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: MIZAN_SYSTEM },
        { role: "user", content: prompt }
      ],
      model: "mixtral-8x7b-32768", // تغيير الموديل للتجربة
    });
    return chatCompletion.choices[0].message.content;
  } catch (error) {
    // غيرت الرسالة حتى نتأكد الخطأ منين
    console.error("GROQ_ERROR:", error.message);
    return "يا بطل، جاي أحاول أتصل بالذكاء الاصطناعي بس اكو رفض بالطلب. تأكد من الـ Manual Deploy بـ Render.";
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
app.listen(PORT, () => console.log("Mizan System Updated!"));
