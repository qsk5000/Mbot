const express = require(“express”);
const { Telegraf } = require(“telegraf”);
const axios = require(“axios”);

const BOT_TOKEN = process.env.BOT_TOKEN || “8664749931:AAGLnIHnBew-hxzcLp1jjchTnIdHNVAGBl8”;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const URL = process.env.WEBHOOK_URL || “https://mbot-lst0.onrender.com”;

const bot = new Telegraf(BOT_TOKEN);
const app = express();
app.use(express.json());

// نصّ التعليمات النظام (System Prompt)
const MIZAN_PROMPT = `أنت ‘ميزان AI’ - مساعد ذكي لمنصة ميزان أكاديمي.

📋 تعليماتك:

- رد بلهجة عراقية محببة وودية
- اركز على خدمة الطلاب والعملاء
- في كل رد اذكر: “باقة كل المواد 💻 بـ 75 ألف فقط”
- شجّع الناس على التسجيل عند @Quizm1
- كن قصير، مركز، وفي الصميم
- استخدم إيموجي عند الحاجة

معلومات عن ميزان:

- منصة تعليمية عراقية
- توفر باقات دراسية شاملة
- تدعم التحضير للامتحانات
- سعر الباقة الكاملة: 75 ألف`;

/**

- استدعاء Groq API
- @param {string} userMessage - رسالة المستخدم
- @returns {Promise<string>} - رد الـ AI
  */
  async function askGroqAI(userMessage) {
  try {
  const response = await axios.post(
  “https://api.groq.com/openai/v1/chat/completions”,
  {
  model: “mixtral-8x7b-32768”, // نموذج قوي ومجاني
  messages: [
  {
  role: “system”,
  content: MIZAN_PROMPT
  },
  {
  role: “user”,
  content: userMessage
  }
  ],
  temperature: 0.7,
  max_tokens: 256,
  top_p: 0.9
  },
  {
  headers: {
  “Authorization”: `Bearer ${GROQ_API_KEY}`,
  “Content-Type”: “application/json”
  }
  }
  );
  
  ```
   // استخراج الرد من الـ response
   if (response.data?.choices?.[0]?.message?.content) {
       return response.data.choices[0].message.content.trim();
   }
  
   return "حصل خطأ، حاول لاحقاً 😔";
  ```
  
  } catch (error) {
  console.error(“Groq API Error:”, {
  status: error.response?.status,
  data: error.response?.data,
  message: error.message
  });
  
  ```
   // رد احتياطي في حال فشل الـ API
   return "هلا بطل! 🎓 حالياً فيه مشكلة صغيرة، بس باقة كل المواد بـ 75 ألف، وتكدر تسجل وتستفسر من @Quizm1. تدلل! 😊";
  ```
  
  }
  }

/**

- معالج الرسائل النصية
  */
  bot.on(“text”, async (ctx) => {
  try {
  // إظهار حالة “يكتب”
  await ctx.sendChatAction(“typing”);
  
  ```
   // الحصول على رد الـ AI
   const userMessage = ctx.message.text;
   console.log(`📨 رسالة من ${ctx.from.username || ctx.from.id}: ${userMessage}`);
  
   const aiResponse = await askGroqAI(userMessage);
  
   // إرسال الرد مع زر التسجيل
   await ctx.reply(aiResponse, {
       reply_markup: {
           inline_keyboard: [
               [
                   {
                       text: "📝 التسجيل مع @Quizm1",
                       url: "https://t.me/Quizm1"
                   },
                   {
                       text: "🌐 ميزان أكاديمي",
                       url: "https://mizaniq.online"
                   }
               ]
           ]
       },
       parse_mode: "HTML"
   });
  
   console.log(`✅ رد تم إرساله`);
  ```
  
  } catch (error) {
  console.error(“Bot Error:”, error.message);
  await ctx.reply(“آسف، حصل خطأ في معالجة رسالتك 😔”);
  }
  });

/**

- معالج الأوامر
  */
  bot.command(“start”, async (ctx) => {
  await ctx.reply(
  “🤖 أهلاً وسهلاً في ميزان AI!\n\n” +
  “أنا هنا لأساعدك بأي استفسار عن منصة ميزان أكاديمي.\n\n” +
  “💻 باقة كل المواد: 75 ألف فقط\n\n” +
  “اكتب أي سؤال وأنا بجاوب عليك! 😊”,
  {
  reply_markup: {
  inline_keyboard: [
  [
  {
  text: “📝 سجل الآن”,
  url: “https://t.me/Quizm1”
  }
  ]
  ]
  }
  }
  );
  });

bot.command(“help”, async (ctx) => {
await ctx.reply(
“📋 كيفية الاستخدام:\n\n” +
“1️⃣ اكتب سؤالك أو استفسارك\n” +
“2️⃣ أنا بجاوب بسرعة\n” +
“3️⃣ اضغط على الزر للتسجيل\n\n” +
“الأسئلة الشائعة:\n” +
“• السعر؟ → 75 ألف\n” +
“• كيف أسجل؟ → اضغط على @Quizm1\n” +
“• أنا بحاجة معلومات أكثر؟ → استفسر من الفريق\n\n” +
“استخدم /start للعودة للرئيسية”
);
});

/**

- webhook للـ Telegram updates
  */
  app.post(”/webhook”, (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
  });

/**

- health check endpoint
  */
  app.get(”/health”, (req, res) => {
  res.json({ status: “✅ Mizan AI is running”, timestamp: new Date().toISOString() });
  });

/**

- تشغيل السيرفر
  */
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, async () => {
  console.log(`\n🚀 Mizan AI (Groq Powered) is Active on port ${PORT}!\n`);
  
  try {
  // تثبيت الـ webhook
  await bot.telegram.setWebhook(`${URL}/webhook`);
  console.log(`✅ Webhook set to: ${URL}/webhook`);
  
  ```
   // اختياري: عرض معلومات البوت
   const botInfo = await bot.telegram.getMe();
   console.log(`🤖 Bot: @${botInfo.username}\n`);
  ```
  
  } catch (error) {
  console.error(“❌ Webhook setup failed:”, error.message);
  }
  });

// معالج الأخطاء العام
process.on(“unhandledRejection”, (reason, promise) => {
console.error(“Unhandled Rejection:”, reason);
});

module.exports = app;
