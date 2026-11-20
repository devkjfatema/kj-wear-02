// পেমেন্ট গেটওয়ে: bKash (Tokenized Checkout) ও SSLCommerz। Nagad ও Stripe এখনো যুক্ত হয়নি।
const E = process.env;
const bkashLive = () => !!(E.BKASH_APP_KEY && E.BKASH_APP_SECRET && E.BKASH_USERNAME && E.BKASH_PASSWORD);
const sslLive = () => !!(E.SSLCZ_STORE_ID && E.SSLCZ_STORE_PASS);
const baseUrl = () => (E.BASE_URL || "http://localhost:3000").replace(/\/$/, "");

/* ---------- bKash ---------- */
const BK = () => (E.BKASH_SANDBOX === "false" ? "https://tokenized.pay.bka.sh/v1.2.0-beta" : "https://tokenized.sandbox.bka.sh/v1.2.0-beta");
let bkTok = { v: null, exp: 0 };
async function bkPost(path, body, withAuth) {
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  if (withAuth) { headers.Authorization = await bkToken(); headers["X-APP-Key"] = E.BKASH_APP_KEY; }
  else { headers.username = E.BKASH_USERNAME; headers.password = E.BKASH_PASSWORD; }
  const r = await fetch(BK() + path, { method: "POST", headers, body: JSON.stringify(body) });
  return r.json();
}
async function bkToken() {
  if (bkTok.v && Date.now() < bkTok.exp) return bkTok.v;
  const j = await bkPost("/tokenized/checkout/token/grant", { app_key: E.BKASH_APP_KEY, app_secret: E.BKASH_APP_SECRET }, false);
  if (!j.id_token) throw new Error("bKash টোকেন পাওয়া যায়নি: " + (j.statusMessage || "অজানা ত্রুটি"));
  bkTok = { v: j.id_token, exp: Date.now() + 50 * 60 * 1000 };
  return bkTok.v;
}
async function bkashCreate(order) {
  const j = await bkPost("/tokenized/checkout/create", {
    mode: "0011", payerReference: order.phone, callbackURL: baseUrl() + "/api/payments/bkash/callback",
    amount: Number(order.total).toFixed(2), currency: "BDT", intent: "sale", merchantInvoiceNumber: order.number
  }, true);
  if (!j.bkashURL || !j.paymentID) throw new Error("bKash পেমেন্ট শুরু করা যায়নি: " + (j.statusMessage || j.errorMessage || "অজানা ত্রুটি"));
  return { url: j.bkashURL, paymentId: j.paymentID };
}
async function bkashExecute(paymentID) { return bkPost("/tokenized/checkout/execute", { paymentID }, true); }

/* ---------- SSLCommerz ---------- */
const SSL = () => (E.SSLCZ_SANDBOX === "false" ? "https://securepay.sslcommerz.com" : "https://sandbox.sslcommerz.com");
async function sslInit(order) {
  const b = baseUrl();
  const f = new URLSearchParams({
    store_id: E.SSLCZ_STORE_ID, store_passwd: E.SSLCZ_STORE_PASS, total_amount: String(order.total), currency: "BDT", tran_id: order.number,
    success_url: b + "/api/payments/sslcommerz/success", fail_url: b + "/api/payments/sslcommerz/fail", cancel_url: b + "/api/payments/sslcommerz/fail",
    cus_name: order.customer_name, cus_email: "customer@kjwear.local", cus_add1: order.address.slice(0, 100), cus_city: "Dhaka", cus_country: "Bangladesh", cus_phone: order.phone,
    shipping_method: "Courier", num_of_item: String(order.items.length), product_name: "KJ Wear order", product_category: "Fashion", product_profile: "physical-goods",
    ship_name: order.customer_name, ship_add1: order.address.slice(0, 100), ship_city: "Dhaka", ship_country: "Bangladesh", ship_postcode: "1000"
  });
  const r = await fetch(SSL() + "/gwprocess/v4/api.php", { method: "POST", body: f });
  const j = await r.json();
  if (j.status !== "SUCCESS" || !j.GatewayPageURL) throw new Error("কার্ড পেমেন্ট শুরু করা যায়নি: " + (j.failedreason || "অজানা ত্রুটি"));
  return { url: j.GatewayPageURL, paymentId: order.number };
}
async function sslValidate(valId) {
  const u = SSL() + "/validator/api/validationserverAPI.php?" + new URLSearchParams({ val_id: valId, store_id: E.SSLCZ_STORE_ID, store_passwd: E.SSLCZ_STORE_PASS, format: "json" });
  return (await fetch(u)).json();
}

module.exports = { bkashLive, sslLive, baseUrl, bkashCreate, bkashExecute, sslInit, sslValidate };
