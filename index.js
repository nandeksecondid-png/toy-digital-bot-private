const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason
} = require("@whiskeysockets/baileys")

const pino = require("pino")

async function startBot() {

const { state, saveCreds } =
await useMultiFileAuthState("./session")

const sock = makeWASocket({
logger: pino({ level: "silent" }),
printQRInTerminal: true,
auth: state,
browser: ["TOY DIGITAL", "Chrome", "1.0.0"]
})

sock.ev.on("creds.update", saveCreds)

sock.ev.on("connection.update", async (update) => {

const { connection, lastDisconnect, qr } = update

if (qr) {
console.log("SCAN QR INI DI WHATSAPP")
}

if (connection === "open") {
console.log("BOT BERHASIL TERHUBUNG")
}

if (connection === "close") {

const shouldReconnect =
lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

console.log("Koneksi terputus. Reconnect:", shouldReconnect)

if (shouldReconnect) {
startBot()
}

}

})

sock.ev.on("messages.upsert", async ({ messages }) => {

const msg = messages[0]

if (!msg.message) return

const text =
msg.message.conversation ||
msg.message.extendedTextMessage?.text

const from = msg.key.remoteJid

if (text === ".menu") {

await sock.sendMessage(from, {
text:
`🔥 TOY DIGITAL BOT 🔥

📦 MENU BOT
• .menu
• .owner
• .ping
• .script

🛡️ FITUR GRUP
• Anti Link
• Welcome
• Anti Spam
• Anti Virtex

💼 FITUR BISNIS
• Auto Respon
• Katalog Produk
• Order Otomatis`
})

}

if (text === ".owner") {

await sock.sendMessage(from, {
text: "Owner: TOY DIGITAL STORE"
})

}

if (text === ".ping") {

await sock.sendMessage(from, {
text: "BOT ONLINE ✅"
})

}

})

}

startBot()
