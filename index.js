const express = require("express");
const { Telegraf } = require("telegraf");
const Groq = require("groq-sdk");

// الإعدادات الخاصة بك
const BOT_TOKEN = "8664749931:AAGLnIHnBew-hxzcLp1jjchTnIdHNVAGBl8";
const GROQ_API_KEY = "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"; 

const bot = new Telegraf(BOT_TOKEN);
const groq = new Groq({ apiKey: GROQ_API_KEY });

const app = express();
app.use(express.json());

// تغذية الذكاء الاصطناعي بمميزات ميزان أكاديمي
const MIZAN_SYSTEM_PROMPT = `
أنت 'ميزان AI' المساعد الذكي الرسمي لمنصة ميزان أكاديمي (Mizan Academy IQ).
مهمتك: مساعدة طلاب السادس الإعدادي بالعراق وتشجيعهم بلهجة عراقية محببة (يا بطل، عيوني، تدلل).

معلومات المنصة الأساسية:
1. الباقات: باقة "كل المواد" بـ 75 ألف دينار فقط (أقوى عرض).
2. المميزات الستة (اشرحها بحماس):
   - جدول أسبوعي منظم: ينهي المنهج بدون تراكمات.
   - اختبارات ذكية يومية: تحاكي النمط الوزاري وتقيم مستواك.
   - حضور إلكتروني ذكي: يتابع التزامك اليومي وانضباطك.
   - إشراف تدريسي مباشر: متابعة من أساتذة مختصين ينطوك النصح.
   - دعم فوري على مدار الساعة: فريقنا وياك لأي سؤال تقني أو تعليمي.
   - تقارير أداء تفصيلية: توضح نقاط قوتك والمواد اللي تحتاج تركيز.
3. للتسجيل والاستفسار: وجه الطالب دائماً يتواصل مع قسم التسجيل @Quizm1.
4. المؤسس: أحمد صبري.
`;

async function askAI(prompt) {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: MIZAN_SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      model: "llama3-8b-8192", // موديل فائق السرعة
      temperature: 0.7,
    });
    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error("Groq Error:", error);
    return "هلا بطل! حالياً اكو ضغط بسيط على السيرفر، بس باختصار: باقة كل المواد بـ 75 ألف، وتكدر تسجل وتستفسر من @Quizm1. تدلل!";
  }
}

// الأوامر
bot.start((ctx) => {
  ctx.reply("هلا بطل! أني 'ميزان AI' مساعدك الذكي بميزان أكاديمي. شنو ببالك سؤال عن المنصة، باقاتنا، أو المميزات؟ 🎓✨", {
    reply_markup: {
      inline_keyboard: [[{ text: "📝 قسم التسجيل @Quizm1", url: "https://t.me/Quizm1" }]]
    }
  });
});

bot.on("text", async (ctx) => {
  await ctx.sendChatAction("typing");
  const response = await askAI(ctx.message.text);
  await ctx.reply(response, {
    reply_markup: {
      inline_keyboard: [[{ text: "📝 قسم التسجيل @Quizm1", url: "https://t.me/Quizm1" }]]
    }
  });
});

// الـ Webhook الخاص بـ Render
app.post("/webhook", (req, res) => {
  bot.handleUpdate(req.body, res);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Mizan AI is now ultra-fast with Groq!"));
