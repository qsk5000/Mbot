const express = require("express");
const { Telegraf } = require("telegraf");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- الإعدادات الخاصة بك ---
const BOT_TOKEN = "8664749931:AAGLnIHnBew-hxzcLp1jjchTnIdHNVAGBl8";
const GEMINI_API_KEY = "AIzaSyBqce2gW49wyyyw76qaGvhtSONREsKTzYk";

const bot = new Telegraf(BOT_TOKEN);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// إعداد نموذج الذكاء الاصطناعي مع تعليمات "ميزان أكاديمي"
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: `أنت 'ميزان AI' المساعد الذكي الرسمي لمنصة ميزان أكاديمي (Mizan Academy IQ).
  
  معلومات المنصة الأساسية (احفظها وجاوب الطلاب بيها):
  - الباقات: باقة "كل المواد" بـ 75 ألف دينار فقط (أقوى عرض للسادس الإعدادي).
  - المؤسس: أحمد صبري.
  
  مميزات المنصة الستة (اشرحها بحماس):
  1. جدول أسبوعي منظم: يساعدك تخلص المنهج بدون تراكمات.
  2. اختبارات ذكية يومية: تحاكي النمط الوزاري وتقيم مستواك.
  3. حضور إلكتروني ذكي: نظام يراقب التزامك اليومي.
  4. إشراف تدريسي مباشر: متابعة من أساتذة مختصين ينطوك النصح.
  5. دعم فوري على مدار الساعة: فريقنا وياك لأي سؤال تقني أو تعليمي.
  6. تقارير أداء تفصيلية: توضح نقاط قوتك والمواد اللي تحتاج تركيز.

  قواعد الإجابة:
  - اللهجة: عراقية محببة (يا بطل، عيوني، تدلل، منور).
  - الهدف: إقناع الطالب بالاشتراك وتوجيهه للتسجيل.
  - للتسجيل: قل للطالب دائماً يتواصل مع قسم التسجيل @Quizm1.`
});

const app = express();
app.use(express.json());

// وظيفة استدعاء الذكاء الاصطناعي
async function askAI(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Error:", error);
    return "عذراً يا بطل، صار عندي خلل فني بسيط.. لحظات وارجعلك! 😅";
  }
}

// أوامر البوت
bot.start((ctx) => {
  ctx.reply("هلا بطل! أني 'ميزان AI' مساعدك الذكي بميزان أكاديمي. شنو ببالك سؤال عن المنصة أو باقاتنا؟ 🎓✨", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📝 تواصل مع قسم التسجيل", url: "https://t.me/Quizm1" }]
      ]
    }
  });
});

// التعامل مع الرسائل النصية
bot.on("text", async (ctx) => {
  await ctx.sendChatAction("typing");
  const userMessage = ctx.message.text;
  const aiResponse = await askAI(userMessage);
  
  await ctx.reply(aiResponse, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📝 تواصل مع قسم التسجيل", url: "https://t.me/Quizm1" }]
      ]
    }
  });
});

// الـ Webhook الخاص بـ Render
app.post("/webhook", (req, res) => {
  bot.handleUpdate(req.body, res);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Mizan AI is Online and Ready!`));
