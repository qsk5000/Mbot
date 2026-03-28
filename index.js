const express = require("express");
const { Telegraf } = require("telegraf");
const axios = require("axios");

const BOT_TOKEN = process.env.BOT_TOKEN || "8664749931:AAGLnIHnBew-hxzcLp1jjchTnIdHNVAGBl8";
const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN; 
const URL = "https://mbot-lst0.onrender.com";

const bot = new Telegraf(BOT_TOKEN);
const app = express();
app.use(express.json());

const MIZAN_PROMPT = "أنت 'ميزان AI' مساعد ذكي لمنصة ميزان أكاديمي. جاوب بلهجة عراقية محببة. باقة كل المواد بـ 75 ألف. للتسجيل @Quizm1.";

async function askAI(userPrompt) {
    try {
        const response = await axios.post(
            "https://router.huggingface.co/models/tiiuae/falcon-7b-instruct",
            {
                inputs: `${MIZAN_PROMPT}\n\nسؤال المستخدم: ${userPrompt}`,
                parameters: {
                    max_new_tokens: 250, // أفضل من max_length لتحديد طول الرد الجديد
                    temperature: 0.7,
                    return_full_text: false // يمنع تكرار السؤال في الإجابة
                },
                options: {
                    wait_for_model: true // ضروري حتى ينتظر الموديل إذا كان "نايم"
                }
            },
            {
                headers: {
                    "Authorization": `Bearer ${HUGGINGFACE_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (response.data && response.data[0]) {
            // بما أننا استخدمنا return_full_text: false، النص الراجع هو الإجابة فقط
            let text = response.data[0].generated_text || "";
            return text.trim() || "حصل خطأ، حاول لاحقاً 😔";
        }
        return "حصل خطأ، حاول لاحقاً 😔";
        
    } catch (error) {
        console.error("HuggingFace Error:", error.response?.data || error.message);
        // رد احتياطي بلهجة المنصة في حال فشل الـ API
        return "هلا بطل! 🎓 حالياً لود عليه، بس باقة كل المواد بـ 75 ألف، وتكدر تسجل وتستفسر من @Quizm1. تدلل! 😊";
    }
}

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
    }
});

app.post("/webhook", (req, res) => {
    bot.handleUpdate(req.body); // تليغراف لا يحتاج res هنا
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log("Mizan AI (HuggingFace Router) is Active! 🤖");
    try {
        await bot.telegram.setWebhook(`${URL}/webhook`);
        console.log("Webhook configured successfully");
    } catch (e) {
        console.log("Webhook setup failed:", e.message);
    }
});
