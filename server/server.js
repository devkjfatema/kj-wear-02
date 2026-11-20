// KJ Wear সার্ভার: ফ্রন্টএন্ড সার্ভ, অর্ডার API, অ্যাডমিন প্যানেল, পেমেন্ট
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");

/* ---------- .env: না থাকলে নিজে তৈরি করে ---------- */
const ENV_FILE = path.join(__dirname, ".env");
function parseEnv(t) { const o = {}; t.split(/\r?\n/).forEach((l) => { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m && !l.trim().startsWith("#")) o[m[1]] = m[2]; }); return o; }
let firstRun = null;
if (!fs.existsSync(ENV_FILE)) {
  const pass = crypto.randomBytes(6).toString("hex");
  let t = fs.readFileSync(path.join(__dirname, ".env.example"), "utf8").replace(/^ADMIN_PASS=.*$/m, "ADMIN_PASS=" + pass).replace(/^SESSION_SECRET=.*$/m, "SESSION_SECRET=" + crypto.randomBytes(24).toString("hex"));
  fs.writeFileSync(ENV_FILE, t); firstRun = pass;
}
const fileEnv = parseEnv(fs.readFileSync(ENV_FILE, "utf8"));
Object.keys(fileEnv).forEach((k) => { if (process.env[k] === undefined || process.env[k] === "") process.env[k] = fileEnv[k]; });
const E = process.env;

const express = require("express");
const multer = require("multer");
const db = require("./db");
const pay = require("./payments");

const ROOT = path.join(__dirname, "..");
const UPLOAD_DIR = path.join(ROOT, "images", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/* ---------- ফ্রন্টএন্ডের config.js থেকে ডেলিভারি/কুপন/পেমেন্ট পড়া (একটাই উৎস) ---------- */
function frontConfig() {
  const sb = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "js", "config.js"), "utf8"), sb);
  return sb.window.KJ_CONFIG;
}

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use((req, res, next) => { res.setHeader("X-Content-Type-Options", "nosniff"); res.setHeader("Referrer-Policy", "same-origin"); next(); });

/* ---------- ছোট রেট-লিমিটার ---------- */
const hits = new Map();
function limit(name, max, ms) {
  return (req, res, next) => {
    const k = name + req.ip, now = Date.now(), a = (hits.get(k) || []).filter((t) => now - t < ms);
    if (a.length >= max) return res.status(429).json({ error: "অনেকবার চেষ্টা হয়েছে, একটু পরে আবার চেষ্টা করুন" });
    a.push(now); hits.set(k, a); next();
  };
}

/* ---------- ফ্রন্টএন্ডের ডাইনামিক ফাইল ---------- */
app.get("/js/products.js", async (req, res, next) => {
  try {
    const rows = await db.query("SELECT * FROM products WHERE active=1 ORDER BY sort_order, created_at");
    res.set("Cache-Control", "no-store").type("application/javascript").send("window.KJ_PRODUCTS = " + JSON.stringify(rows.map(db.rowToProduct)) + ";");
  } catch (e) { next(e); }
});
app.get("/js/config.js", (req, res) => {
  const src = fs.readFileSync(path.join(ROOT, "js", "config.js"), "utf8");
  const inject = `\n;(function(){var c=window.KJ_CONFIG;c.apiBase=c.apiBase||"/";c.payments.card.live=${pay.sslLive()};` +
    `c.payments.card.provider="sslcommerz";if(${pay.bkashLive()}){c.payments.bkash.mode="api";}else{c.payments.bkash.mode="manual";}c.payments.nagad.mode="manual";})();`;
  res.set("Cache-Control", "no-store").type("application/javascript").send(src + inject);
});

/* ---------- অর্ডার তৈরি (দাম সবসময় সার্ভার থেকে হিসাব) ---------- */
const PHONE = /^01[3-9]\d{8}$/;
const clean = (s, n) => String(s == null ? "" : s).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
async function buildOrder(body, method) {
  const cfg = frontConfig();
  const c = body.customer || {};
  const name = clean(c.name, 120), phone = clean(c.phone, 20), addr = clean(c.address, 500), area = c.area === "outside" ? "outside" : "inside";
  if (name.length < 2) throw httpErr(400, "নাম দিন");
  if (!PHONE.test(phone)) throw httpErr(400, "সঠিক মোবাইল নম্বর দিন");
  if (addr.length < 8) throw httpErr(400, "পূর্ণ ঠিকানা দিন");
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 40) throw httpErr(400, "কার্ট খালি");
  const pcfg = cfg.payments[method];
  if (!pcfg || !pcfg.enabled) throw httpErr(400, "এই পেমেন্ট পদ্ধতি চালু নেই");

  const items = [];
  let subtotal = 0;
  for (const it of body.items) {
    const rows = await db.query("SELECT * FROM products WHERE id=? AND active=1", [clean(it.id, 64)]);
    if (!rows.length) throw httpErr(400, "একটি পণ্য আর পাওয়া যাচ্ছে না, কার্ট আবার দেখুন");
    const p = db.rowToProduct(rows[0]);
    const qty = Math.min(Math.max(parseInt(it.qty, 10) || 1, 1), 20);
    const color = p.colors.some((x) => x.name === it.color) ? it.color : p.colors[0].name;
    const size = p.sizes.includes(String(it.size)) ? String(it.size) : p.sizes[0];
    const price = p.price == null ? 0 : p.price;
    subtotal += price * qty;
    items.push({ id: p.id, name: p.name, color, size, qty, price: p.price });
  }
  let discount = 0, coupon = null;
  const code = clean(body.coupon, 40).toUpperCase();
  if (code && cfg.coupons[code]) { const cp = cfg.coupons[code]; coupon = code; discount = cp.type === "percent" ? Math.round((subtotal * cp.value) / 100) : Math.min(cp.value, subtotal); }
  let delivery = area === "inside" ? cfg.delivery.insideDhaka : cfg.delivery.outsideDhaka;
  if (cfg.delivery.freeOver && subtotal >= cfg.delivery.freeOver) delivery = 0;

  const pay_ = body.payment || {};
  let trx = null, sender = null, status = "cod";
  if (method === "bkash" || method === "nagad") {
    if (method === "nagad" || !pay.bkashLive()) {
      sender = clean(pay_.senderNumber, 20); trx = clean(pay_.trxId, 60).toUpperCase();
      if (!PHONE.test(sender)) throw httpErr(400, "যে নম্বর থেকে টাকা পাঠিয়েছেন সেটা সঠিক দিন");
      if (trx.length < 6) throw httpErr(400, "সঠিক TrxID দিন");
      status = "pending_verification";
    } else status = "awaiting_payment";
  } else if (method === "card") status = "awaiting_payment";

  const number = /^KJ\d{8}$/.test(body.number || "") ? body.number : "KJ" + String(Date.now()).slice(-8);
  return { number, customer_name: name, phone, area, address: addr, note: clean(c.note, 300), items, subtotal, discount, delivery, total: subtotal - discount + delivery, coupon, pay_method: method, pay_status: status, trx_id: trx, sender_number: sender };
}
async function saveOrder(o) {
  const ex = await db.query("SELECT * FROM orders WHERE number=?", [o.number]);
  if (ex.length) return ex[0]; // একই অর্ডার দ্বিতীয়বার এলে বদলাবে না
  await db.query(
    "INSERT INTO orders (number,customer_name,phone,area,address,note,items,subtotal,discount,delivery,total,coupon,pay_method,pay_status,trx_id,sender_number) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [o.number, o.customer_name, o.phone, o.area, o.address, o.note || null, JSON.stringify(o.items), o.subtotal, o.discount, o.delivery, o.total, o.coupon, o.pay_method, o.pay_status, o.trx_id, o.sender_number]
  );
  return (await db.query("SELECT * FROM orders WHERE number=?", [o.number]))[0];
}
function httpErr(code, msg) { const e = new Error(msg); e.status = code; return e; }
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

app.post("/api/orders", limit("ord", 20, 3600e3), wrap(async (req, res) => {
  const o = await buildOrder(req.body, clean((req.body.payment || {}).method, 20));
  if (o.pay_status === "awaiting_payment") throw httpErr(400, "এই পেমেন্ট অনলাইনে সম্পন্ন করতে হবে");
  const row = await saveOrder(o);
  res.json({ ok: true, number: row.number, total: row.total });
}));

/* ---------- অনলাইন পেমেন্ট শুরু ---------- */
async function startOnline(req, res, method, gateway) {
  const o = await buildOrder(req.body.order || {}, method);
  const row = await saveOrder(o);
  const order = Object.assign({}, row, { items: JSON.parse(row.items) });
  const r = await gateway(order);
  await db.query("UPDATE orders SET pay_ref=? WHERE number=?", [r.paymentId, row.number]);
  res.json({ ok: true, paymentUrl: r.url, paymentId: r.paymentId });
}
app.post("/api/payments/bkash/create", limit("pay", 20, 3600e3), wrap(async (req, res) => {
  if (!pay.bkashLive()) throw httpErr(400, "bKash API চালু নেই। ম্যানুয়াল মোড ব্যবহার করুন");
  await startOnline(req, res, "bkash", pay.bkashCreate);
}));
app.post("/api/payments/sslcommerz/init", limit("pay", 20, 3600e3), wrap(async (req, res) => {
  if (!pay.sslLive()) throw httpErr(400, "কার্ড পেমেন্ট চালু নেই");
  await startOnline(req, res, "card", pay.sslInit);
}));
app.post("/api/payments/nagad/create", (req, res) => res.status(501).json({ error: "Nagad API এখনো যুক্ত হয়নি। ম্যানুয়াল মোড (নম্বর + TrxID) ব্যবহার করুন" }));
app.post("/api/payments/stripe/create", (req, res) => res.status(501).json({ error: "Stripe যুক্ত হয়নি। কার্ডের জন্য SSLCommerz ব্যবহার হচ্ছে" }));

const done = (res, number) => res.redirect(303, "/confirmation.html?order=" + encodeURIComponent(number));
const failed = (res) => res.redirect(303, "/checkout.html?payment=failed");
app.get("/api/payments/bkash/callback", wrap(async (req, res) => {
  const id = clean(req.query.paymentID, 80);
  const rows = await db.query("SELECT * FROM orders WHERE pay_ref=? AND pay_method='bkash'", [id]);
  if (!rows.length) return failed(res);
  const o = rows[0];
  if (req.query.status !== "success") { await db.query("UPDATE orders SET pay_status='failed' WHERE id=? AND pay_status='awaiting_payment'", [o.id]); return failed(res); }
  if (o.pay_status === "paid") return done(res, o.number);
  const j = await pay.bkashExecute(id);
  if (j.statusCode === "0000" && j.transactionStatus === "Completed" && Number(j.amount) === Number(o.total)) {
    await db.query("UPDATE orders SET pay_status='paid', trx_id=? WHERE id=?", [clean(j.trxID, 60), o.id]);
    return done(res, o.number);
  }
  await db.query("UPDATE orders SET pay_status='failed' WHERE id=?", [o.id]);
  failed(res);
}));
app.all("/api/payments/sslcommerz/success", wrap(async (req, res) => {
  const b = Object.assign({}, req.query, req.body);
  const rows = await db.query("SELECT * FROM orders WHERE number=? AND pay_method='card'", [clean(b.tran_id, 20)]);
  if (!rows.length || !b.val_id) return failed(res);
  const o = rows[0];
  if (o.pay_status === "paid") return done(res, o.number);
  const j = await pay.sslValidate(clean(b.val_id, 80));
  if ((j.status === "VALID" || j.status === "VALIDATED") && j.tran_id === o.number && Math.abs(Number(j.amount) - Number(o.total)) < 1) {
    await db.query("UPDATE orders SET pay_status='paid', trx_id=? WHERE id=?", [clean(j.bank_tran_id, 60), o.id]);
    return done(res, o.number);
  }
  await db.query("UPDATE orders SET pay_status='failed' WHERE id=?", [o.id]);
  failed(res);
}));
app.all("/api/payments/sslcommerz/fail", wrap(async (req, res) => {
  const b = Object.assign({}, req.query, req.body);
  await db.query("UPDATE orders SET pay_status='failed' WHERE number=? AND pay_status='awaiting_payment'", [clean(b.tran_id, 20)]);
  failed(res);
}));

/* ---------- অ্যাডমিন লগইন (সই-করা কুকি) ---------- */
const SECRET = () => E.SESSION_SECRET || "dev-secret";
const sign = (v) => crypto.createHmac("sha256", SECRET()).update(v).digest("hex");
function makeToken() { const p = Buffer.from(JSON.stringify({ u: E.ADMIN_USER || "admin", exp: Date.now() + 12 * 3600e3 })).toString("base64url"); return p + "." + sign(p); }
function readCookie(req, k) { const m = (req.headers.cookie || "").split(/;\s*/).map((x) => x.split("=")).find((x) => x[0] === k); return m ? m[1] : ""; }
function authed(req) {
  const t = readCookie(req, "kj_admin"); const [p, s] = t.split(".");
  if (!p || !s) return false;
  const a = Buffer.from(sign(p)), b = Buffer.from(s);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try { return JSON.parse(Buffer.from(p, "base64url").toString()).exp > Date.now(); } catch (e) { return false; }
}
const safeEq = (a, b) => { const x = crypto.createHash("sha256").update(String(a)).digest(), y = crypto.createHash("sha256").update(String(b)).digest(); return crypto.timingSafeEqual(x, y); };
app.post("/api/admin/login", limit("login", 8, 15 * 60e3), (req, res) => {
  const { username, password } = req.body || {};
  if (E.ADMIN_PASS && safeEq(username, E.ADMIN_USER || "admin") && safeEq(password, E.ADMIN_PASS)) {
    res.setHeader("Set-Cookie", "kj_admin=" + makeToken() + "; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200" + (pay.baseUrl().startsWith("https") ? "; Secure" : ""));
    return res.json({ ok: true });
  }
  res.status(401).json({ error: "ইউজারনেম বা পাসওয়ার্ড ভুল" });
});
app.post("/api/admin/logout", (req, res) => { res.setHeader("Set-Cookie", "kj_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0"); res.json({ ok: true }); });
const guard = (req, res, next) => (authed(req) ? next() : res.status(401).json({ error: "লগইন করুন" }));
app.get("/api/admin/me", guard, (req, res) => res.json({ ok: true, categories: frontConfig().categories, payments: { bkash: pay.bkashLive(), card: pay.sslLive() } }));

/* ---------- অ্যাডমিন: অর্ডার ---------- */
const STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled"];
app.get("/api/admin/orders", guard, wrap(async (req, res) => {
  const st = clean(req.query.status, 20);
  const rows = st ? await db.query("SELECT * FROM orders WHERE status=? ORDER BY id DESC LIMIT 500", [st]) : await db.query("SELECT * FROM orders ORDER BY id DESC LIMIT 500");
  res.json(rows.map((r) => Object.assign({}, r, { items: JSON.parse(r.items) })));
}));
app.patch("/api/admin/orders/:id", guard, wrap(async (req, res) => {
  const id = parseInt(req.params.id, 10), b = req.body || {};
  if (b.status !== undefined) { if (!STATUSES.includes(b.status)) throw httpErr(400, "অবৈধ স্ট্যাটাস"); await db.query("UPDATE orders SET status=? WHERE id=?", [b.status, id]); }
  if (b.pay_status !== undefined) { if (!["paid", "pending_verification", "cod", "failed"].includes(b.pay_status)) throw httpErr(400, "অবৈধ পেমেন্ট স্ট্যাটাস"); await db.query("UPDATE orders SET pay_status=? WHERE id=?", [b.pay_status, id]); }
  res.json({ ok: true });
}));

/* ---------- অ্যাডমিন: পণ্য ---------- */
function productFromBody(b, id) {
  const name = clean(b.name, 200);
  if (!name) throw httpErr(400, "পণ্যের নাম দিন");
  const cat = frontConfig().categories.map((c) => c.id);
  if (!cat.includes(b.category)) throw httpErr(400, "ক্যাটাগরি বেছে নিন");
  const sizes = (Array.isArray(b.sizes) ? b.sizes : String(b.sizes || "").split(",")).map((s) => clean(s, 10)).filter(Boolean);
  if (!sizes.length) throw httpErr(400, "অন্তত একটা সাইজ দিন");
  const colors = (Array.isArray(b.colors) ? b.colors : []).map((c) => ({ name: clean(c.name, 40), hex: /^#[0-9a-fA-F]{6}$/.test(c.hex) ? c.hex : "#888888", images: (Array.isArray(c.images) ? c.images : []).map((u) => clean(u, 300)).filter((u) => /^(images\/|https?:\/\/)/.test(u)) })).filter((c) => c.name);
  if (!colors.length) throw httpErr(400, "অন্তত একটা রঙ দিন");
  const num = (v) => (v === "" || v == null || isNaN(+v) ? null : Math.max(0, Math.round(+v)));
  return [id, b.category, name, clean(b.nameEn, 200) || null, num(b.price), num(b.oldPrice), clean(b.badge, 40) || null, b.isNew ? 1 : 0, b.featured ? 1 : 0, b.active === false ? 0 : 1, clean(b.desc, 2000) || null, clean(b.descEn, 2000) || null, JSON.stringify(sizes), JSON.stringify(colors)];
}
app.get("/api/admin/products", guard, wrap(async (req, res) => {
  const rows = await db.query("SELECT * FROM products ORDER BY sort_order, created_at");
  res.json(rows.map((r) => Object.assign(db.rowToProduct(r), { active: !!r.active })));
}));
app.post("/api/admin/products", guard, wrap(async (req, res) => {
  const id = /^[\w-]{2,60}$/.test(req.body.id || "") ? req.body.id : "p-" + Date.now().toString(36);
  if ((await db.query("SELECT id FROM products WHERE id=?", [id])).length) throw httpErr(400, "এই id আগে থেকেই আছে");
  const v = productFromBody(req.body, id);
  const [{ m }] = await db.query("SELECT COALESCE(MAX(sort_order),0) AS m FROM products");
  await db.query("INSERT INTO products (id,category,name,name_en,price,old_price,badge,is_new,featured,active,description,description_en,sizes,colors,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", v.concat([Number(m) + 1]));
  res.json({ ok: true, id });
}));
app.put("/api/admin/products/:id", guard, wrap(async (req, res) => {
  const v = productFromBody(req.body, req.params.id);
  await db.query("UPDATE products SET category=?,name=?,name_en=?,price=?,old_price=?,badge=?,is_new=?,featured=?,active=?,description=?,description_en=?,sizes=?,colors=? WHERE id=?", v.slice(1).concat([req.params.id]));
  res.json({ ok: true });
}));
app.delete("/api/admin/products/:id", guard, wrap(async (req, res) => { await db.query("DELETE FROM products WHERE id=?", [req.params.id]); res.json({ ok: true }); }));

/* ---------- ছবি আপলোড ---------- */
const EXT = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
const upload = multer({
  storage: multer.diskStorage({ destination: UPLOAD_DIR, filename: (req, f, cb) => cb(null, Date.now().toString(36) + crypto.randomBytes(4).toString("hex") + EXT[f.mimetype]) }),
  limits: { fileSize: 6 * 1024 * 1024, files: 10 },
  fileFilter: (req, f, cb) => cb(EXT[f.mimetype] ? null : httpErr(400, "শুধু JPG, PNG বা WebP ছবি দিন"), !!EXT[f.mimetype])
});
app.post("/api/admin/upload", guard, upload.array("files", 10), (req, res) => res.json({ ok: true, urls: req.files.map((f) => "images/uploads/" + f.filename) }));

/* ---------- স্ট্যাটিক ফাইল ---------- */
app.use((req, res, next) => (/^\/(server|node_modules)(\/|$)/i.test(req.path) || /\/\./.test(req.path) ? res.status(404).end() : next()));
app.use("/admin", express.static(path.join(__dirname, "admin")));
app.use(express.static(ROOT, { dotfiles: "deny", index: "index.html", maxAge: 0 }));

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") err = httpErr(400, "ছবি ৬MB এর বেশি");
  const code = err.status || 500;
  if (code === 500) console.error(err);
  if (req.path.startsWith("/api/")) return res.status(code).json({ error: code === 500 ? "সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করুন" : err.message });
  res.status(code).send("Error");
});

const PORT = +(E.PORT || 3000);
db.init(E).then(() => {
  app.listen(PORT, () => {
    console.log("\nKJ Wear সার্ভার চালু: http://localhost:" + PORT);
    console.log("অ্যাডমিন প্যানেল:    http://localhost:" + PORT + "/admin/");
    if (firstRun) console.log("\nপ্রথমবার চালু হয়েছে। অ্যাডমিন লগইন:\n  ইউজারনেম: " + (E.ADMIN_USER || "admin") + "\n  পাসওয়ার্ড: " + firstRun + "\n(server/.env ফাইলে আছে, বদলাতে পারবেন)\n");
    console.log("bKash API: " + (pay.bkashLive() ? "চালু" : "বন্ধ (ম্যানুয়াল মোড)") + " | কার্ড (SSLCommerz): " + (pay.sslLive() ? "চালু" : "বন্ধ"));
  });
}).catch((e) => { console.error("\nডেটাবেসে সংযোগ হয়নি: " + e.message + "\nserver/.env এ DB_HOST, DB_USER, DB_PASSWORD ঠিক আছে কি না দেখুন এবং MySQL চালু আছে কি না নিশ্চিত করুন।"); process.exit(1); });
