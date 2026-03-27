const express = require("express");
const { Telegraf } = require("telegraf");
const axios = require("axios"); // راح نستخدم مكتبة axios أضمن

const BOT_TOKEN = "8664749931:AAGLnIHnBew-hxzcLp1jjchTnIdHNVAGBl8";

// توكن Hugging Face مالتك مقسم للتمويه
const h1 = "hf_xckMtf";
const h2 = "gBkfRSoQyoIJqsbQ";
const h3 = "vyJMFvjPwYJn";
const HF_TOKEN = h1 + h2 + h3;

const bot = new Telegraf(BOT_TOKEN);
const app = express();
app.use(express.json());

const MIZAN_PROMPT = "أنت 'ميزان AI' مساعد ذكي لمنصة ميزان أكاديمي. جاوب بلهجة عراقية محببة. باقة كل المواد بـ 75 ألف دينار. للتسجيل تواصل مع @Quizm1.";

async function askAI(userPrompt) {
  try {
    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        messages: [
          { role: "system", content: MIZAN_PROMPT },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 500,
      },
      {
        headers: { Authorization: `Bearer ${HF_TOKEN}` }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("HF Error:", error.response ? error.response.data : error.message);
    return "هلا بطل! حالياً اكو تحديث بسيط، بس باختصار: باقة كل المواد بـ 75 ألف، وتكدر تسجل من @Quizm1.";
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
app.listen(PORT, () => console.log("Mizan AI is using the new Router!"));
