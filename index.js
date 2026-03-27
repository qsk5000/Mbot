const express = require("express");
const { Telegraf } = require("telegraf");
const axios = require("axios");

const BOT_TOKEN = process.env.BOT_TOKEN || "8664749931:AAGLnIHnBew-hxzcLp1jjchTnIdHNVAGBl8";
const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;
// استبدل الرابط برابط مشروعك الحقيقي بـ Render
const URL = "https://mbot-lst0.onrender.com"; 

const bot = new Telegraf(BOT_TOKEN);
const app = express();
app.use(express.json());

const MIZAN_PROMPT = "أنت 'ميزان AI' مساعد ذكي لمنصة ميزان أكاديمي. جاوب بلهجة عراقية محببة. باقة كل المواد بـ 75 ألف. للتسجيل @Quizm1.";

async function askAI(userPrompt) {
    try {
        const response = await axios.post(
            "https://api.anthropic.com/v1/messages",
            {
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 400,
                system: MIZAN_PROMPT,
                messages: [{ role: "user", content: userPrompt }]
            },
            {
                headers: {
                    "x-api-key": CLAUDE_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
                }
            }
        );
        return response.data.content[0].text;
    } catch (error) {
        console.error("Claude Error:", error.response?.data || error.message);
        return "هلا بطل! 🎓 باقة كل المواد بـ 75 ألف، وتكدر تسجل وتستفسر من @Quizm1. تدلل! 😊";
    }
}

bot.on("text", async (ctx) => {
    try {
        await ctx.sendChatAction("typing");
        const result = await askAI(ctx.message.text);
        await ctx.reply(result, {
            reply_markup: {
                inline_keyboard: [[{ text: "📝 قسم التسجيل @Quizm1", url: "https://t.me/Quizm1" }]]
            }
        });
    } catch (error) {
        console.log("Bot Reply Error:", error.message);
    }
});

app.post("/webhook", (req, res) => {
    bot.handleUpdate(req.body, res);
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log("Mizan AI is Active!");
    try {
        await bot.telegram.setWebhook(`${URL}/webhook`);
    } catch (e) {
        console.log("Webhook set error:", e.message);
    }
});
