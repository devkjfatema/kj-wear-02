// MySQL সংযোগ, টেবিল তৈরি ও প্রথমবারের পণ্য সিড
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DDL = [
  `CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY, category VARCHAR(40) NOT NULL, name VARCHAR(200) NOT NULL, name_en VARCHAR(200) NULL,
    price INT NULL, old_price INT NULL, badge VARCHAR(40) NULL,
    is_new TINYINT(1) NOT NULL DEFAULT 0, featured TINYINT(1) NOT NULL DEFAULT 0, active TINYINT(1) NOT NULL DEFAULT 1,
    description TEXT NULL, description_en TEXT NULL, sizes TEXT NOT NULL, colors LONGTEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY, number VARCHAR(20) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, status VARCHAR(20) NOT NULL DEFAULT 'new',
    customer_name VARCHAR(120) NOT NULL, phone VARCHAR(20) NOT NULL, area VARCHAR(10) NOT NULL, address TEXT NOT NULL, note TEXT NULL,
    items LONGTEXT NOT NULL, subtotal INT NOT NULL, discount INT NOT NULL DEFAULT 0, delivery INT NOT NULL, total INT NOT NULL, coupon VARCHAR(40) NULL,
    pay_method VARCHAR(20) NOT NULL, pay_status VARCHAR(30) NOT NULL, pay_ref VARCHAR(120) NULL, trx_id VARCHAR(60) NULL, sender_number VARCHAR(20) NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
];

let pool;
async function init(env) {
  const base = { host: env.DB_HOST || "127.0.0.1", port: +(env.DB_PORT || 3306), user: env.DB_USER || "root", password: env.DB_PASSWORD || "" };
  const name = (env.DB_NAME || "kjwear").replace(/[^\w]/g, "");
  const conn = await mysql.createConnection(base);
  await conn.query("CREATE DATABASE IF NOT EXISTS `" + name + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
  await conn.end();
  pool = mysql.createPool(Object.assign({}, base, { database: name, charset: "utf8mb4", waitForConnections: true, connectionLimit: 10 }));
  for (const sql of DDL) await pool.query(sql);
  await seedProducts();
}
const query = async (sql, params) => (await pool.query(sql, params || []))[0];

// প্রথমবার ফ্রন্টএন্ডের js/products.js থেকে ২৪টা প্লেসহোল্ডার পণ্য ডেটাবেসে তোলা
async function seedProducts() {
  const [{ n }] = await query("SELECT COUNT(*) AS n FROM products");
  if (Number(n) > 0) return;
  const file = path.join(__dirname, "..", "js", "products.js");
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(file, "utf8"), sandbox);
  const list = sandbox.window.KJ_PRODUCTS || [];
  let i = 0;
  for (const p of list) {
    await query(
      "INSERT INTO products (id,category,name,name_en,price,old_price,badge,is_new,featured,active,description,description_en,sizes,colors,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [p.id, p.category, p.name, p.nameEn || null, p.price == null ? null : p.price, p.oldPrice || null, p.badge || null, p.isNew ? 1 : 0, p.featured ? 1 : 0, 1, p.desc || null, p.descEn || null, JSON.stringify(p.sizes), JSON.stringify(p.colors), i++]
    );
  }
  console.log("  " + list.length + "টি প্লেসহোল্ডার পণ্য যোগ হয়েছে।");
}

function rowToProduct(r) {
  const p = { id: r.id, category: r.category, name: r.name, price: r.price == null ? null : r.price, sizes: JSON.parse(r.sizes), colors: JSON.parse(r.colors), desc: r.description || "" };
  if (r.name_en) p.nameEn = r.name_en;
  if (r.description_en) p.descEn = r.description_en;
  if (r.old_price) p.oldPrice = r.old_price;
  if (r.badge) p.badge = r.badge;
  if (r.is_new) p.isNew = true;
  if (r.featured) p.featured = true;
  return p;
}
module.exports = { init, query, rowToProduct };
