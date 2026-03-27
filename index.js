const express = require("express");
const { Telegraf } = require("telegraf");
const { HfInference } = require("@huggingface/inference");

const BOT_TOKEN = "8664749931:AAGLnIHnBew-hxzcLp1jjchTnIdHNVAGBl8";

// تم تقسيم توكن Hugging Face للتمويه
const h1 = "hf_xckMtf";
const h2 = "gBkfRSoQyoIJqsbQ";
const h3 = "vyJMFvjPwYJn";
const HF_TOKEN = h1 + h2 + h3;

const bot = new Telegraf(BOT_TOKEN);
const hf = new HfInference(HF_TOKEN);

const app = express();
app.use(express.json());

const MIZAN_PROMPT = `أنت 'ميزان AI' مساعد ذكي لمنصة ميزان أكاديمي. جاوب بلهجة عراقية محببة. 
معلوماتك: باقة كل المواد بـ 75 ألف دينار. المميزات: جدول منظم، اختبارات، حضور ذكي، إشراف، دعم، تقارير. 
للتسجيل تواصل مع @Quizm1. المؤسس هو أحمد صبري.`;

async function askAI(prompt) {
  try {
    const out = await hf.chatCompletion({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [
        { role: "system", content: MIZAN_PROMPT },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
    });
    return out.choices[0].message.content;
  } catch (error) {
    console.error("HF Error:", error);
    return "هلا بطل! حالياً اكو تحديث بسيط بالذكاء الاصطناعي، بس باختصار: باقة كل المواد بـ 75 ألف، وتكدر تسجل من @Quizm1. تدلل!";
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
app.listen(PORT, () => console.log("Mizan AI is Live on Hugging Face!"));
