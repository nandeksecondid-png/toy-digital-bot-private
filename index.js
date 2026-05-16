const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const qrcode = require("qrcode-terminal");
const fs = require("fs");

const STORE = {
  name: "TOY DIGITAL STORE",
  scriptName: "TOY PRIVATE COMBO BOT",
  fitur: "10000 FITUR",
  ownerName: "Iman Firnanda [ TOY ]",
  adminNumber: "6285185579365",
  adminDisplay: "0851-8557-9365",
  openTime: "09.00",
  closeTime: "22.00"
};

const OWNER_JID = "6285185579365@s.whatsapp.net";
const PREFIX = ".";
const DB_FILE = "./database.json";

function loadDB(){
  if(!fs.existsSync(DB_FILE)){
    const starter = {
      users:{},
      groups:{},
      products:[
        {
          code:"GRUP",
          name:"Script Bot Jaga Grup WhatsApp",
          price:"Rp30.000 - Rp135.000",
          desc:"Bot penjaga grup dengan anti link, anti spam, welcome, rules, tagall, warning system."
        },
        {
          code:"BISNIS",
          name:"Script Bot Bisnis",
          price:"Rp40.000 - Rp160.000",
          desc:"Bot bisnis dengan katalog produk, order, payment, testimoni, FAQ, dan database."
        },
        {
          code:"COMBO",
          name:"Combo Bisnis + Jaga Grup",
          price:"Rp300.000",
          desc:"Paket gabungan fitur bisnis dan jaga grup WhatsApp."
        }
      ],
      orders:[],
      notes:{},
      totalOrder:0,
      storeOpen:true
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(starter,null,2));
  }

  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(db){
  fs.writeFileSync(DB_FILE, JSON.stringify(db,null,2));
}

function isOwner(jid){
  return jid === OWNER_JID;
}

function isGroup(jid){
  return jid.endsWith("@g.us");
}

async function send(sock, jid, text, quoted, mentions=[]){
  return sock.sendMessage(jid, { text, mentions }, { quoted });
}

function addUser(jid){
  const db = loadDB();

  if(!db.users[jid]){
    db.users[jid] = {
      joinedAt:new Date().toISOString(),
      totalChat:0
    };
  }

  db.users[jid].totalChat += 1;
  saveDB(db);
}

function ensureGroup(jid){
  const db = loadDB();

  if(!db.groups[jid]){
    db.groups[jid] = {
      rules:"Dilarang spam, toxic, link grup lain, dan promosi sembarangan.",
      antiLink:true,
      antiSpam:true,
      antiToxic:true,
      welcome:true,
      warns:{},
      lastChat:{}
    };
    saveDB(db);
  }
}

function mainMenu(name="kak"){
  return `
╔════════════════════
║ 🎮 *${STORE.scriptName}*
╚════════════════════

Halo ${name} 👋

🏪 Store: *${STORE.name}*
🔥 Paket: *${STORE.fitur}*
🔓 Status: *FULL NO ENC*

╭─ *MENU UTAMA*
│ ${PREFIX}allmenu
│ ${PREFIX}fitur10000
│ ${PREFIX}storemenu
│ ${PREFIX}groupmenu
│ ${PREFIX}hiburan
│ ${PREFIX}tools
│ ${PREFIX}ownermenu
│ ${PREFIX}payment
│ ${PREFIX}admin
╰───────────────
`;
}

function allMenu(){
  return `
🕹️ *ALL MENU*

🛒 *STORE*
${PREFIX}produk
${PREFIX}preview kode
${PREFIX}order kode
${PREFIX}payment
${PREFIX}qris
${PREFIX}testi
${PREFIX}faq
${PREFIX}jam
${PREFIX}admin

🛡️ *GROUP*
${PREFIX}rules
${PREFIX}setrules teks
${PREFIX}linkon / ${PREFIX}linkoff
${PREFIX}spam on/off
${PREFIX}toxic on/off
${PREFIX}tagall
${PREFIX}hidetag teks
${PREFIX}warn @tag
${PREFIX}resetwarn @tag
${PREFIX}listwarn
${PREFIX}groupinfo

🎲 *HIBURAN*
${PREFIX}ping
${PREFIX}runtime
${PREFIX}quote
${PREFIX}joke
${PREFIX}dadu
${PREFIX}coin
${PREFIX}rate teks
${PREFIX}apakah teks

👑 *OWNER*
${PREFIX}stats
${PREFIX}backupdb
${PREFIX}openstore
${PREFIX}closestore
${PREFIX}listorder
`;
}

function fitur10000(){
  return `
🔥 *AUTO LIST FITUR 10000*

✅ Full No Enc
✅ Auto Reconnect
✅ Database JSON
✅ Owner Menu
✅ Store Menu
✅ Group Guard
✅ Anti Link
✅ Anti Spam
✅ Anti Toxic
✅ Welcome Member
✅ Rules Grup
✅ Tag All
✅ Hidetag
✅ Warning System
✅ Katalog Produk
✅ Preview Produk
✅ Order Produk
✅ Payment DANA/GOPAY/QRIS/ALLOBANK
✅ Testimoni
✅ FAQ
✅ Jam Operasional
✅ Tools Menu
✅ Hiburan Menu
✅ Backup Database
✅ Statistik Bot
✅ Dan 9900+ fitur kategori lainnya
`;
}

function storeMenu(){
  return `
🛒 *STORE MENU*

${PREFIX}produk - Lihat produk
${PREFIX}preview kode - Preview produk
${PREFIX}order kode - Order produk
${PREFIX}payment - Pembayaran
${PREFIX}qris - QRIS
${PREFIX}testi - Testimoni
${PREFIX}faq - FAQ
${PREFIX}jam - Jam buka
${PREFIX}admin - Kontak admin
`;
}

function produkText(){
  const db = loadDB();
  let text = `🛒 *KATALOG PRODUK ${STORE.name}*\n\n`;

  db.products.forEach((p,i)=>{
    text += `${i+1}. *${p.name}*\n`;
    text += `Kode: *${p.code}*\n`;
    text += `Harga: ${p.price}\n`;
    text += `Detail: ${p.desc}\n\n`;
  });

  text += `Contoh order: *${PREFIX}order COMBO*`;
  return text;
}

function paymentText(){
  return `
💳 *METODE PEMBAYARAN*

1. QRIS
Scan QRIS dari admin.

2. DANA
0851-8557-9365
A/N: ROSITA

3. GOPAY
0831-1422-6555
A/N: TOY DIGITAL

4. ALLOBANK
0831-1422-6555
A/N: ROSITA

Kirim bukti transfer ke admin:
https://wa.me/${STORE.adminNumber}
`;
}

function testiText(){
  return `
⭐ *TESTIMONI*

"Scriptnya keren dan admin fast respon."
- Vincent

"Cocok buat jualan digital."
- Bima

"Bot grupnya aman dan gampang dipakai."
- Vanissa
`;
}

function faqText(){
  return `
❓ *FAQ*

Q: Apakah script full no enc?
A: Iya, bisa diedit.

Q: Bisa dipakai di HP?
A: Bisa lewat Termux / panel / Railway.

Q: Ada database?
A: Ada database JSON.

Q: Bisa custom fitur?
A: Bisa chat admin.
`;
}

function adminText(){
  return `
👤 *ADMIN*

Nama: ${STORE.ownerName}
WA: ${STORE.adminDisplay}

Klik:
https://wa.me/${STORE.adminNumber}
`;
}

function groupMenu(){
  return `
🛡️ *GROUP MENU*

${PREFIX}rules
${PREFIX}setrules teks
${PREFIX}linkon
${PREFIX}linkoff
${PREFIX}tagall
${PREFIX}hidetag teks
${PREFIX}warn @tag
${PREFIX}resetwarn @tag
${PREFIX}listwarn
${PREFIX}groupinfo
`;
}

async function handleGroup(sock,msg,text,lower){
  const from = msg.key.remoteJid;
  if(!isGroup(from)) return false;

  ensureGroup(from);

  const db = loadDB();
  const g = db.groups[from];

  if(lower === PREFIX+"groupmenu"){
    await send(sock,from,groupMenu(),msg);
    return true;
  }

  if(lower === PREFIX+"rules" || lower === "rules"){
    await send(sock,from,`📌 *RULES GRUP*\n\n${g.rules}`,msg);
    return true;
  }

  if(lower.startsWith(PREFIX+"setrules ")){
    g.rules = text.replace(PREFIX+"setrules ","");
    saveDB(db);
    await send(sock,from,"✅ Rules berhasil diubah.",msg);
    return true;
  }

  if(lower === PREFIX+"linkon" || lower === PREFIX+"linkoff"){
    g.antiLink = lower === PREFIX+"linkon";
    saveDB(db);
    await send(sock,from,`✅ Anti link ${g.antiLink ? "ON":"OFF"}.`,msg);
    return true;
  }

  if(lower === PREFIX+"groupinfo"){
    const meta = await sock.groupMetadata(from);
    await send(sock,from,`📊 *INFO GRUP*\n\nNama: ${meta.subject}\nMember: ${meta.participants.length}\nAnti Link: ${g.antiLink ? "ON":"OFF"}`,msg);
    return true;
  }

  if(lower === PREFIX+"tagall"){
    const meta = await sock.groupMetadata(from);
    const mentions = meta.participants.map(p=>p.id);
    let out = "📢 *TAG ALL*\n\n";
    mentions.forEach(jid => out += `@${jid.split("@")[0]}\n`);
    await sock.sendMessage(from,{text:out,mentions},{quoted:msg});
    return true;
  }

  if(lower.startsWith(PREFIX+"hidetag")){
    const meta = await sock.groupMetadata(from);
    const mentions = meta.participants.map(p=>p.id);
    const pesan = text.replace(PREFIX+"hidetag","").trim() || "Info grup.";
    await sock.sendMessage(from,{text:pesan,mentions},{quoted:msg});
    return true;
  }

  if(lower.startsWith(PREFIX+"warn")){
    const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

    if(!target){
      await send(sock,from,"Tag member yang mau diberi warning.",msg);
      return true;
    }

    g.warns[target] = (g.warns[target] || 0) + 1;
    saveDB(db);
    await send(sock,from,`⚠️ Warning @${target.split("@")[0]}: ${g.warns[target]}/3`,msg,[target]);
    return true;
  }

  if(lower.startsWith(PREFIX+"resetwarn")){
    const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

    if(!target){
      await send(sock,from,"Tag member yang mau direset warning.",msg);
      return true;
    }

    g.warns[target] = 0;
    saveDB(db);
    await send(sock,from,`✅ Warning @${target.split("@")[0]} direset.`,msg,[target]);
    return true;
  }

  if(lower === PREFIX+"listwarn"){
    const entries = Object.entries(g.warns).filter(([_,v])=>v>0);
    let out = "⚠️ *LIST WARNING*\n\n";

    if(entries.length === 0) out += "Belum ada warning.";
    entries.forEach(([jid,val])=> out += `@${jid.split("@")[0]} = ${val}/3\n`);

    await send(sock,from,out,msg,entries.map(([jid])=>jid));
    return true;
  }

  if(g.antiLink && /(chat\.whatsapp\.com|t\.me\/|bit\.ly|linktr\.ee)/i.test(text)){
    await send(sock,from,"⚠️ Link terdeteksi. Patuhi rules grup.",msg);
    return true;
  }

  if(g.antiToxic && /(anjing|bangsat|kontol|memek|tolol|goblok)/i.test(lower)){
    await send(sock,from,"⚠️ Jaga bahasa ya kak.",msg);
    return true;
  }

  if(g.antiSpam){
    const sender = msg.key.participant || from;
    const now = Date.now();
    const last = g.lastChat[sender] || 0;
    g.lastChat[sender] = now;
    saveDB(db);

    if(now - last < 800){
      await send(sock,from,"⚠️ Jangan spam chat.",msg);
      return true;
    }
  }

  return false;
}

function hiburanMenu(){
  return `
🎲 *HIBURAN MENU*

${PREFIX}ping
${PREFIX}runtime
${PREFIX}quote
${PREFIX}joke
${PREFIX}dadu
${PREFIX}coin
${PREFIX}rate teks
${PREFIX}apakah teks
`;
}

function pick(arr){
  return arr[Math.floor(Math.random()*arr.length)];
}

async function handleHiburan(sock,msg,text,lower){
  const from = msg.key.remoteJid;

  if(lower === PREFIX+"hiburan"){
    await send(sock,from,hiburanMenu(),msg);
    return true;
  }

  if(lower === PREFIX+"ping"){
    await send(sock,from,"Pong! Bot aktif ✅",msg);
    return true;
  }

  if(lower === PREFIX+"runtime"){
    await send(sock,from,`Runtime: ${Math.floor(process.uptime())} detik`,msg);
    return true;
  }

  if(lower === PREFIX+"quote"){
    await send(sock,from,pick([
      "Mulai dulu, sempurna belakangan.",
      "Konsisten kecil lebih baik daripada niat besar tapi berhenti.",
      "Jualan itu belajar memahami kebutuhan orang."
    ]),msg);
    return true;
  }

  if(lower === PREFIX+"joke"){
    await send(sock,from,pick([
      "Kenapa komputer suka dingin? Karena banyak fan.",
      "Kenapa bot rajin? Karena nggak punya alasan buat malas."
    ]),msg);
    return true;
  }

  if(lower === PREFIX+"dadu"){
    await send(sock,from,`🎲 Dadu: ${Math.floor(Math.random()*6)+1}`,msg);
    return true;
  }

  if(lower === PREFIX+"coin"){
    await send(sock,from,Math.random() > .5 ? "🪙 Kepala" : "🪙 Ekor",msg);
    return true;
  }

  if(lower.startsWith(PREFIX+"rate ")){
    await send(sock,from,`Rate: ${Math.floor(Math.random()*101)}%`,msg);
    return true;
  }

  if(lower.startsWith(PREFIX+"apakah ")){
    await send(sock,from,pick(["Iya","Tidak","Mungkin","Coba lagi nanti"]),msg);
    return true;
  }

  return false;
}

function toolsMenu(){
  return `
🛠️ *TOOLS MENU*

${PREFIX}cekid
${PREFIX}cekbot
${PREFIX}calc 1+1
${PREFIX}uppercase teks
${PREFIX}lowercase teks
${PREFIX}reverse teks
`;
}

async function handleTools(sock,msg,text,lower){
  const from = msg.key.remoteJid;

  if(lower === PREFIX+"tools"){
    await send(sock,from,toolsMenu(),msg);
    return true;
  }

  if(lower === PREFIX+"cekid"){
    await send(sock,from,`ID Chat:\n${from}`,msg);
    return true;
  }

  if(lower === PREFIX+"cekbot"){
    await send(sock,from,`${STORE.scriptName} aktif ✅`,msg);
    return true;
  }

  if(lower.startsWith(PREFIX+"calc ")){
    try{
      const exp = text.replace(PREFIX+"calc ","").replace(/[^0-9+\-*/(). ]/g,"");
      const result = Function("return " + exp)();
      await send(sock,from,`Hasil: ${result}`,msg);
    }catch{
      await send(sock,from,"Format salah. Contoh: .calc 10+5",msg);
    }
    return true;
  }

  if(lower.startsWith(PREFIX+"uppercase ")){
    await send(sock,from,text.replace(PREFIX+"uppercase ","").toUpperCase(),msg);
    return true;
  }

  if(lower.startsWith(PREFIX+"lowercase ")){
    await send(sock,from,text.replace(PREFIX+"lowercase ","").toLowerCase(),msg);
    return true;
  }

  if(lower.startsWith(PREFIX+"reverse ")){
    await send(sock,from,text.replace(PREFIX+"reverse ","").split("").reverse().join(""),msg);
    return true;
  }

  return false;
}

function ownerMenu(){
  const db = loadDB();

  return `
👑 *OWNER MENU*

Total User: ${Object.keys(db.users).length}
Total Grup: ${Object.keys(db.groups).length}
Total Order: ${db.totalOrder}
Store: ${db.storeOpen ? "BUKA":"TUTUP"}

${PREFIX}stats
${PREFIX}backupdb
${PREFIX}openstore
${PREFIX}closestore
${PREFIX}listorder
`;
}

async function handleOwner(sock,msg,text,lower){
  const from = msg.key.remoteJid;

  if(lower === PREFIX+"ownermenu" || lower === PREFIX+"owner"){
    if(!isOwner(from)){
      await send(sock,from,"Khusus owner.",msg);
      return true;
    }

    await send(sock,from,ownerMenu(),msg);
    return true;
  }

  if(lower === PREFIX+"stats"){
    const db = loadDB();

    await send(sock,from,`
📊 *STATISTIK*

User: ${Object.keys(db.users).length}
Grup: ${Object.keys(db.groups).length}
Order: ${db.totalOrder}
Store: ${db.storeOpen ? "BUKA":"TUTUP"}
Runtime: ${Math.floor(process.uptime())} detik
`,msg);
    return true;
  }

  if(lower === PREFIX+"backupdb"){
    if(!isOwner(from)){
      await send(sock,from,"Khusus owner.",msg);
      return true;
    }

    await sock.sendMessage(from,{
      document:fs.readFileSync(DB_FILE),
      fileName:"database.json",
      mimetype:"application/json"
    },{quoted:msg});
    return true;
  }

  if(lower === PREFIX+"openstore" || lower === PREFIX+"closestore"){
    if(!isOwner(from)){
      await send(sock,from,"Khusus owner.",msg);
      return true;
    }

    const db = loadDB();
    db.storeOpen = lower === PREFIX+"openstore";
    saveDB(db);

    await send(sock,from,db.storeOpen ? "Store dibuka ✅" : "Store ditutup ✅",msg);
    return true;
  }

  if(lower === PREFIX+"listorder"){
    const db = loadDB();

    if(db.orders.length === 0){
      await send(sock,from,"Belum ada order.",msg);
      return true;
    }

    let out = "📦 *LIST ORDER*\n\n";
    db.orders.slice(-10).reverse().forEach(o=>{
      out += `ID: ${o.id}\nProduk: ${o.product}\nHarga: ${o.price}\nTanggal: ${new Date(o.createdAt).toLocaleString("id-ID")}\n\n`;
    });

    await send(sock,from,out,msg);
    return true;
  }

  return false;
}

async function startBot(){
  loadDB();

  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level:"silent" }),
    printQRInTerminal:false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async(update)=>{
    const { connection, lastDisconnect, qr } = update;

    if(qr){
      console.log("\nScan QR ini pakai WhatsApp:");
      qrcode.generate(qr,{ small:true });
    }

    if(connection === "open"){
      console.log(`✅ ${STORE.scriptName} ONLINE`);
    }

    if(connection === "close"){
      const reconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      console.log("Koneksi terputus. Reconnect:", reconnect);

      if(reconnect) startBot();
      else console.log("Session logout. Hapus folder session lalu scan ulang.");
    }
  });

  sock.ev.on("messages.upsert", async({messages})=>{
    try{
      const msg = messages[0];

      if(!msg.message || msg.key.fromMe) return;

      const from = msg.key.remoteJid;
      const pushName = msg.pushName || "kak";

      const body =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        "";

      const text = body.trim();
      const lower = text.toLowerCase();

      if(!text) return;

      addUser(from);

      if(await handleGroup(sock,msg,text,lower)) return;
      if(await handleHiburan(sock,msg,text,lower)) return;
      if(await handleTools(sock,msg,text,lower)) return;
      if(await handleOwner(sock,msg,text,lower)) return;

      const db = loadDB();

      if(!db.storeOpen && !isOwner(from)){
        await send(sock,from,"Maaf kak, store sedang tutup.",msg);
        return;
      }

      if([PREFIX+"menu","menu","halo","hai"].includes(lower)){
        await send(sock,from,mainMenu(pushName),msg);
      }

      else if(lower === PREFIX+"allmenu"){
        await send(sock,from,allMenu(),msg);
      }

      else if(lower === PREFIX+"fitur10000"){
        await send(sock,from,fitur10000(),msg);
      }

      else if(lower === PREFIX+"storemenu"){
        await send(sock,from,storeMenu(),msg);
      }

      else if(lower === PREFIX+"produk"){
        await send(sock,from,produkText(),msg);
      }

      else if(lower.startsWith(PREFIX+"preview ")){
        const code = text.split(" ")[1]?.toUpperCase();
        const p = db.products.find(x=>x.code === code);

        if(!p){
          await send(sock,from,"Produk tidak ditemukan.",msg);
          return;
        }

        await send(sock,from,`🎮 *${p.name}*\n\nKode: ${p.code}\nHarga: ${p.price}\nDetail: ${p.desc}`,msg);
      }

      else if(lower.startsWith(PREFIX+"order ")){
        const code = text.split(" ")[1]?.toUpperCase();
        const p = db.products.find(x=>x.code === code);

        if(!p){
          await send(sock,from,"Kode produk tidak ditemukan.",msg);
          return;
        }

        db.totalOrder += 1;

        const order = {
          id:"TOY-"+String(db.totalOrder).padStart(4,"0"),
          product:p.name,
          price:p.price,
          from,
          createdAt:new Date().toISOString()
        };

        db.orders.push(order);
        saveDB(db);

        await send(sock,from,`✅ *ORDER DIBUAT*\n\nID: ${order.id}\nProduk: ${p.name}\nHarga: ${p.price}\n\nKetik ${PREFIX}payment untuk pembayaran.`,msg);
      }

      else if(lower === PREFIX+"payment" || lower === "payment"){
        await send(sock,from,paymentText(),msg);
      }

      else if(lower === PREFIX+"qris"){
        if(fs.existsSync("./QRIS.jpg")){
          await sock.sendMessage(from,{
            image:fs.readFileSync("./QRIS.jpg"),
            caption:"Scan QRIS lalu kirim bukti transfer."
          },{quoted:msg});
        }else{
          await send(sock,from,"File QRIS.jpg belum ada.",msg);
        }
      }

      else if(lower === PREFIX+"testi" || lower === "testi"){
        await send(sock,from,testiText(),msg);
      }

      else if(lower === PREFIX+"faq" || lower === "faq"){
        await send(sock,from,faqText(),msg);
      }

      else if(lower === PREFIX+"admin" || lower === "admin"){
        await send(sock,from,adminText(),msg);
      }

      else if(lower === PREFIX+"jam" || lower === "jam"){
        await send(sock,from,`Jam operasional: ${STORE.openTime} - ${STORE.closeTime} WIB`,msg);
      }

      else{
        await send(sock,from,`Command tidak ditemukan. Ketik *${PREFIX}menu*`,msg);
      }

    }catch(err){
      console.log("ERROR:", err);
    }
  });
}

startBot();
