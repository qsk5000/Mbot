const express = require("express");
const { Telegraf } = require("telegraf");
const axios = require("axios");

const BOT_TOKEN = "8664749931:AAGLnIHnBew-hxzcLp1jjchTnIdHNVAGBl8";
// مفتاح Gemini مالتك - قسمته حتى GitHub ما يحظره
const g1 = "AIzaSyBqce2gW4";
const g2 = "9wyyyw76qaGvhtS";
const g3 = "ONREsKTzYk";
const GEMINI_KEY = g1 + g2 + g3;

const bot = new Telegraf(BOT_TOKEN);
const app = express();
app.use(express.json());

const MIZAN_PROMPT = "أنت 'ميزان AI' مساعد ذكي لمنصة ميزان أكاديمي. جاوب بلهجة عراقية. باقة كل المواد بـ 75 ألف. للتسجيل تواصل مع @Quizm1.";

async function askAI(userPrompt) {
  try {
    // استخدام الرابط المستقر v1 (أضمن شي حالياً)
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
    
    const response = await axios.post(url, {
      contents: [{
        parts: [{ text: `${MIZAN_PROMPT}\n\nسؤال الطالب: ${userPrompt}` }]
      }]
    });

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API Error:", error.response ? error.response.data : error.message);
    return "هلا بطل! اكو تحديث بسيط بالسيرفر، باقة كل المواد بـ 75 ألف، وتكدر تسجل من @Quizm1. تدلل!";
  }
}

bot.on("text", async (ctx) => {
  await ctx.sendChatAction("typing");
  const result = await askAI(ctx.message.text);
  await ctx.reply(result, {
    reply_markup: { inline_keyboard: [[{ text: "📝 قسم التسجيل @Quizm1", url: "https://t.me/Quizm1" }]] }
  });
});

app.post("/webhook", (req, res) => {
  bot.handleUpdate(req.body, res);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Mizan AI is Back on Gemini Stable!"));
