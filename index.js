const express = require("express");
const { Telegraf } = require("telegraf");

// ضع توكن بوتك هنا من BotFather
const BOT_TOKEN = "8664749931:AAGLnIHnBew-hxzcLp1jjchTnIdHNVAGBl8"; 
const bot = new Telegraf(BOT_TOKEN);
const app = express();

app.use(express.json());

// أوامر البوت
bot.start((ctx) => ctx.reply("أهلاً بك في بوت ميزان أكاديمي! 🎓✨"));
bot.help((ctx) => ctx.reply("كيف يمكنني مساعدتك؟"));
bot.on("text", (ctx) => ctx.reply(`وصلت رسالتك: ${ctx.message.text}`));

// رابط الـ Webhook (هذا ضروري لـ Render)
app.post("/webhook", (req, res) => {
  bot.handleUpdate(req.body, res);
  res.sendStatus(200);
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
