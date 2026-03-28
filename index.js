const express = require(“express”);
const { Telegraf } = require(“telegraf”);
const axios = require(“axios”);

const BOT_TOKEN = process.env.BOT_TOKEN || “8664749931:AAGLnIHnBew-hxzcLp1jjchTnIdHNVAGBl8”;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // احصل عليها من https://makersuite.google.com/app/apikeys
const URL = “https://mbot-lst0.onrender.com”;

const bot = new Telegraf(BOT_TOKEN);
const app = express();
app.use(express.json());

const MIZAN_PROMPT = “أنت ‘ميزان AI’ مساعد ذكي لمنصة ميزان أكاديمي. جاوب بلهجة عراقية محببة. باقة كل المواد بـ 75 ألف. للتسجيل @Quizm1.”;

async function askAI(userPrompt) {
try {
const response = await axios.post(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
{
contents: [
{
role: “user”,
parts: [
{
text: `${MIZAN_PROMPT}\n\nسؤال المستخدم: ${userPrompt}`
}
]
}
]
},
{
headers: {
“Content-Type”: “application/json”
}
}
);

```
    // استخراج الرد من response Gemini
    if (response.data.candidates && response.data.candidates[0]) {
        const content = response.data.candidates[0].content;
        if (content.parts && content.parts[0]) {
            return content.parts[0].text;
        }
    }
    return "حصل خطأ، حاول لاحقا 😔";
    
} catch (error) {
    console.error("Gemini Error:", error.response?.data || error.message);
    console.error("Full Error:", error);
    return "هلا بطل! 🎓 باقة كل المواد بـ 75 ألف، وتكدر تسجل وتستفسر من @Quizm1. تدلل! 😊";
}
```

}

bot.on(“text”, async (ctx) => {
try {
await ctx.sendChatAction(“typing”);
const result = await askAI(ctx.message.text);
await ctx.reply(result, {
reply_markup: {
inline_keyboard: [[
{ text: “📝 قسم التسجيل @Quizm1”, url: “https://t.me/Quizm1” }
]]
}
});
} catch (error) {
console.log(“Bot Reply Error:”, error.message);
await ctx.reply(“حدث خطأ، حاول لاحقا 😔”);
}
});

app.post(”/webhook”, (req, res) => {
bot.handleUpdate(req.body, res);
res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
console.log(“Mizan AI is Active (Gemini Free)! 🤖”);
try {
await bot.telegram.setWebhook(`${URL}/webhook`);
console.log(“Webhook set successfully”);
} catch (e) {
console.log(“Webhook set error:”, e.message);
}
});
