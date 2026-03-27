const express = require("express");
const { Telegraf } = require("telegraf");
const Groq = require("groq-sdk");

const BOT_TOKEN = "8664749931:AAGLnIHnBew-hxzcLp1jjchTnIdHNVAGBl8";
// هنا مخلين الكود يسحب المفتاح من إعدادات ريندر بأمان
const GROQ_API_KEY = process.env.GROQ_API_KEY; 

const bot = new Telegraf(BOT_TOKEN);
const groq = new Groq({ apiKey: GROQ_API_KEY });

const app = express();
app.use(express.json());

const MIZAN_SYSTEM_PROMPT = `أنت 'ميزان AI' المساعد الذكي لمنصة ميزان أكاديمي. جاوب بلهجة عراقية عن الباقات (75 ألف لكل المواد) والمميزات الستة والتسجيل عبر @Quizm1.`;

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
    console.error("Error details:", error);
    return "هلا بطل! حالياً اكو تحديث بسيط بالسيرفر، تواصل وية @Quizm1 وتدلل!";
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
app.listen(PORT, () => console.log("Mizan AI is waiting for Key..."));
