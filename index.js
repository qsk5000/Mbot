const express = require("express");
const { Telegraf } = require("telegraf");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const BOT_TOKEN = "8664749931:AAGLnIHnBew-hxzcLp1jjchTnIdHNVAGBl8";
const GEMINI_API_KEY = "AIzaSyBqce2gW49wyyyw76qaGvhtSONREsKTzYk"; 

const bot = new Telegraf(BOT_TOKEN);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// تعديل السطر المسبب للمشكلة:
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const app = express();
app.use(express.json());

async function askAI(prompt) {
  try {
    // إضافة التعليمات هنا داخل الطلب لضمان التوافق
    const fullPrompt = `أنت ميزان AI، مساعد ذكي لمنصة ميزان أكاديمي. جاوب بلهجة عراقية عن الباقات (75 ألف لكل المواد) والمميزات والتسجيل عبر @Quizm1. السؤال هو: ${prompt}`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "هلا بطل! حالياً اكو ضغط بسيط، بس باختصار: باقة كل المواد بـ 75 ألف، وتكدر تسجل وتستفسر من @Quizm1.";
  }
}

bot.on("text", async (ctx) => {
  await ctx.sendChatAction("typing");
  const response = await askAI(ctx.message.text);
  await ctx.reply(response, {
    reply_markup: { inline_keyboard: [[{ text: "📝 قسم التسجيل", url: "https://t.me/Quizm1" }]] }
  });
});

app.post("/webhook", (req, res) => {
  bot.handleUpdate(req.body, res);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Mizan AI is fixed!"));
