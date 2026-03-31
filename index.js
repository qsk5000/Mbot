require('dotenv').config();
const express = require("express");
const { Telegraf } = require("telegraf");
const axios = require("axios");

// الإعدادات من متغيرات البيئة
const BOT_TOKEN = process.env.BOT_TOKEN || "8664749931:AAGLnIHnBew-hxzcLp1jjchTnIdHNVAGBl8";
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const URL = process.env.WEBHOOK_URL || "https://mbot-lst0.onrender.com";

const bot = new Telegraf(BOT_TOKEN);
const app = express();
app.use(express.json());

// نص التعليمات النظام (System Prompt)
const MIZAN_PROMPT = `أنت ‘ميزان AI’ - مساعد ذكي لمنصة ميزان أكاديمي.

📋 تعليماتك:
- رد بلهجة عراقية محببة وودية.
- اركز على خدمة الطلاب والعملاء.
- في كل رد اذكر: “باقة كل المواد 💻 بـ 75 ألف فقط”.
- شجّع الناس على التسجيل عند @Quizm1.
- كن قصير، مركز، وفي الصميم.
- استخدم إيموجي عند الحاجة.

معلومات عن ميزان:
- منصة تعليمية عراقية.
- توفر باقات دراسية شاملة.
- تدعم التحضير للامتحانات.
- سعر الباقة الكاملة: 75 ألف.`;

/**
 * استدعاء Groq API للحصول على رد ذكي
 */
async function askGroqAI(userMessage) {
    try {
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "mixtral-8x7b-32768",
                messages: [
                    { role: "system", content: MIZAN_PROMPT },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 256,
                top_p: 0.9
            },
            {
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (response.data?.choices?.[0]?.message?.content) {
            return response.data.choices[0].message.content.trim();
        }
        return "حصل خطأ بسيط، حاول مرة ثانية 😔";

    } catch (error) {
        console.error("Groq API Error:", error.message);
        return "هلا بطل! 🎓 حالياً فيه مشكلة تقنية، بس باقة كل المواد بـ 75 ألف، وتكدر تسجل وتستفسر من @Quizm1. تدلل! 😊";
    }
}

/**
 * معالج الرسائل النصية من المستخدمين
 */
bot.on("text", async (ctx) => {
    try {
        await ctx.sendChatAction("typing");
        const userMessage = ctx.message.text;
        
        console.log(`📨 رسالة من ${ctx.from.username || ctx.from.id}: ${userMessage}`);

        const aiResponse = await askGroqAI(userMessage);

        await ctx.reply(aiResponse, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "📝 التسجيل مع @Quizm1", url: "https://t.me/Quizm1" },
                        { text: "🌐 ميزان أكاديمي", url: "https://mizaniq.online" }
                    ]
                ]
            },
            parse_mode: "HTML"
        });

    } catch (error) {
        console.error("Bot Error:", error.message);
        await ctx.reply("آسف، صار خطأ بمعالجة رسالتك 😔");
    }
});

/**
 * الأوامر الأساسية (Start & Help)
 */
bot.command("start", async (ctx) => {
    await ctx.reply(
        "🤖 أهلاً وسهلاً في ميزان AI!\n\n" +
        "أنا هنا لأساعدك بأي استفسار عن منصة ميزان أكاديمي.\n\n" +
        "💻 باقة كل المواد: 75 ألف فقط\n\n" +
        "اكتب أي سؤال وأنا بجاوب عليك! 😊",
        {
            reply_markup: {
                inline_keyboard: [[{ text: "📝 سجل الآن", url: "https://t.me/Quizm1" }]]
            }
        }
    );
});

bot.command("help", async (ctx) => {
    await ctx.reply(
        "📋 كيفية الاستخدام:\n\n" +
        "1️⃣ اكتب سؤالك مباشرة\n" +
        "2️⃣ راح أجاوبك باللهجة العراقية وبسرعة\n" +
        "3️⃣ تكدر تضغط على الأزرار للتسجيل أو زيارة الموقع\n\n" +
        "السعر؟ 75 ألف فقط لكل المواد.\n" +
        "استخدم /start للرجوع."
    );
});

/**
 * إعدادات الـ Webhook و Express
 */
app.post("/webhook", (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

app.get("/health", (req, res) => {
    res.json({ status: "running", timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    try {
        await bot.telegram.setWebhook(`${URL}/webhook`);
        console.log(`✅ Webhook set to: ${URL}/webhook`);
    } catch (e) {
        console.error("❌ Webhook Error:", e.message);
    }
});
