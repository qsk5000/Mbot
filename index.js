const express = require("express");
const { Telegraf } = require("telegraf");
const axios = require("axios");

const BOT_TOKEN = "8664749931:AAGLnIHnBew-hxzcLp1jjchTnIdHNVAGBl8";
const bot = new Telegraf(BOT_TOKEN);
const app = express();
app.use(express.json());

const MIZAN_PROMPT = "أنت 'ميزان AI' مساعد ذكي لمنصة ميزان أكاديمي. جاوب بلهجة عراقية. باقة كل المواد بـ 75 ألف. للتسجيل @Quizm1.";

async function askAI(userPrompt) {
  try {
    // استخدام محرك ذكاء اصطناعي مفتوح وسريع جداً
    const response = await axios.get(`https://api.popcat.xyz/ai?text=${encodeURIComponent(MIZAN_PROMPT + " " + userPrompt)}`);
    return response.data.answer;
  } catch (error) {
    return "هلا بطل! باقة كل المواد بـ 75 ألف، وتكدر تسجل وتستفسر من @Quizm1. تدلل!";
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
app.listen(PORT, () => console.log("Mizan AI is finally flying!"));
