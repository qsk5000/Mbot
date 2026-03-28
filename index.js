const express = require("express");
const { Telegraf } = require("telegraf");
const axios = require("axios");

// تعريف الثوابت (تأكد من ضبط المتغيرات في Render)
const BOT_TOKEN = process.env.BOT_TOKEN || "8664749931:AAGLnIHnBew-hxzcLp1jjchTnIdHNVAGBl8";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
const URL = "https://mbot-lst0.onrender.com";

const bot = new Telegraf(BOT_TOKEN);
const app = express();
app.use(express.json());

// التوجيهات الخاصة بالذكاء الاصطناعي
const MIZAN_PROMPT = "أنت 'ميزان AI' مساعد ذكي لمنصة ميزان أكاديمي. جاوب بلهجة عراقية محببة. باقة كل المواد بـ 75 ألف. للتسجيل @Quizm1.";

async function askAI(userPrompt) {
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{ text: `${MIZAN_PROMPT}\n\nسؤال المستخدم: ${userPrompt}` }]
                }]
            },
            { headers: { "Content-Type": "application/json" } }
        );

        // استخراج النص من استجابة Gemini 2.0
        if (response.data && response.data.candidates && response.data.candidates[0].content) {
            return response.data.candidates[0].content.parts[0].text;
        }
        
        return "عذراً بطل، صار عندي خلل بسيط. جرب مرة ثانية؟ 😔";

    } catch (error) {
        console.error("Gemini Error:", error.response?.data || error.message);
        // رسالة احتياطية في حال تعطل الـ API أو انتهاء الكوتا
        return "هلا بطل! 🎓 حالياً لود عليه، بس باقة كل المواد بـ 75 ألف، وتكدر تسجل وتستفسر من @Quizm1. تدلل! 😊";
    }
}

// التعامل مع الرسائل النصية
bot.on("text", async (ctx) => {
    try {
        await ctx.sendChatAction("typing");
        const result = await askAI(ctx.message.text);
        
        await ctx.reply(result, {
            reply_markup: {
                inline_keyboard: [[
                    { text: "📝 قسم التسجيل @Quizm1", url: "https://t.me/Quizm1" }
                ]]
            }
        });
    } catch (error) {
        console.log("Bot Reply Error:", error.message);
        // لا ترسل رسالة خطأ للمستخدم هنا لضمان تجربة سلسة
    }
});

// إعداد الـ Webhook
app.post("/webhook", (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log("Mizan AI (Gemini 2.0 Flash) is Active! 🤖");
    try {
        // حذف الـ Webhook القديم وتعيين الجديد لضمان التحديث
        await bot.telegram.setWebhook(`${URL}/webhook`);
        console.log("Webhook configured successfully");
    } catch (e) {
        console.log("Webhook setup failed:", e.message);
    }
});
