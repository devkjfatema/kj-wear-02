/* KJ Wear — পেমেন্ট মডিউল
   প্রতিটি গেটওয়ের জন্য আলাদা অ্যাডাপ্টার। config.js এ key বসালে API মোড চালু হবে।
   process(order) → Promise<{status:"placed"|"pending"|"redirect", url?, ref?}> */
(function () {
  var KJ = window.KJ, CFG = KJ.cfg;
  function api(path, body) {
    return fetch(CFG.apiBase.replace(/\/$/, "") + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { if (!r.ok) throw new Error("সার্ভার ত্রুটি"); return r.json(); });
  }
  function manualFields(g) {
    return '<div class="pay-info"><p>নিচের <strong>' + KJ.esc(g.numberType) + '</strong> নম্বরে টাকা পাঠান: <strong class="num">' + KJ.esc(g.number) + '</strong></p>' +
      '<p class="muted small">"Send Money" করে টাকা পাঠান, তারপর নিচে আপনার নম্বর ও TrxID দিন।</p>' +
      '<div class="two"><div class="field"><label for="payFrom">যে নম্বর থেকে পাঠিয়েছেন</label><input id="payFrom" inputmode="numeric" placeholder="01XXXXXXXXX" autocomplete="tel"></div>' +
      '<div class="field"><label for="payTrx">TrxID</label><input id="payTrx" placeholder="যেমন 9A7B6C5D" autocapitalize="characters"></div></div></div>';
  }
  function manualProcess(name, key) {
    return function (order) {
      var f = (KJ.$("#payFrom") || {}).value || "", t = ((KJ.$("#payTrx") || {}).value || "").trim().toUpperCase();
      if (!/^01[3-9]\d{8}$/.test(f.trim())) return Promise.reject(new Error(name + " এর যে নম্বর থেকে টাকা পাঠিয়েছেন সেটা সঠিকভাবে দিন"));
      if (t.length < 6) return Promise.reject(new Error("সঠিক TrxID দিন"));
      order.payment.senderNumber = f.trim(); order.payment.trxId = t;
      return Promise.resolve({ status: "pending", ref: t });
    };
  }
  function apiProcess(name, path) {
    return function (order) {
      if (!CFG.apiBase) return Promise.reject(new Error(name + " API চালু করতে config.js এ apiBase ও key দিন"));
      return api(path, { order: order }).then(function (r) { return { status: "redirect", url: r.paymentUrl || r.url, ref: r.paymentId || "" }; });
    };
  }

  var adapters = {
    cod: { label: CFG.payments.cod.label, fields: function () { return '<div class="pay-info"><p>' + KJ.esc(CFG.payments.cod.note) + '</p></div>'; }, process: function () { return Promise.resolve({ status: "placed" }); } },
    bkash: {
      label: "bKash",
      fields: function () { var g = CFG.payments.bkash; return g.mode === "api" ? '<div class="pay-info"><p>"অর্ডার করুন" চাপলে bKash পেমেন্ট পেজে যাবেন।</p></div>' : manualFields(g); },
      process: function (o) { var g = CFG.payments.bkash; return (g.mode === "api" ? apiProcess("bKash", "/api/payments/bkash/create") : manualProcess("bKash")).call(null, o); }
    },
    nagad: {
      label: "Nagad",
      fields: function () { var g = CFG.payments.nagad; return g.mode === "api" ? '<div class="pay-info"><p>"অর্ডার করুন" চাপলে Nagad পেমেন্ট পেজে যাবেন।</p></div>' : manualFields(g); },
      process: function (o) { var g = CFG.payments.nagad; return (g.mode === "api" ? apiProcess("Nagad", "/api/payments/nagad/create") : manualProcess("Nagad")).call(null, o); }
    },
    card: {
      label: "কার্ড (Visa / Mastercard)",
      ready: function () { return !!(CFG.apiBase && CFG.payments.card.live); },
      fields: function () { return this.ready() ? '<div class="pay-info"><p>"অর্ডার করুন" চাপলে নিরাপদ কার্ড পেমেন্ট পেজে যাবেন।</p></div>' : '<div class="pay-info"><p>কার্ড পেমেন্ট শীঘ্রই চালু হবে। এখন ক্যাশ অন ডেলিভারি, bKash বা Nagad ব্যবহার করুন।</p></div>'; },
      process: function (o) { var c = CFG.payments.card; return apiProcess("কার্ড", c.provider === "stripe" ? "/api/payments/stripe/create" : "/api/payments/sslcommerz/init")(o); }
    }
  };

  KJ.payments = {
    list: function () { return Object.keys(adapters).filter(function (k) { return CFG.payments[k] && CFG.payments[k].enabled; }).map(function (k) { return { id: k, label: adapters[k].label, ready: adapters[k].ready ? adapters[k].ready() : true }; }); },
    fields: function (id) { return adapters[id].fields(); },
    process: function (id, order) { return adapters[id].process(order); }
  };

  /* ---------- অর্ডার সামারি (WhatsApp / ইমেইল / SMS হুক) ---------- */
  KJ.orderSummary = function (o) {
    var lines = o.items.map(function (i, n) { return (n + 1) + ". " + i.name + " (" + i.color + ", সাইজ " + i.size + ") × " + i.qty + " = " + (i.price == null ? "[দাম]" : KJ.money(i.price * i.qty)); });
    return CFG.brand.name + " — নতুন অর্ডার " + o.number + "\n\n" + lines.join("\n") + "\n\nসাবটোটাল: " + KJ.money(o.subtotal) + (o.discount ? "\nছাড়: -" + KJ.money(o.discount) : "") + "\nডেলিভারি: " + KJ.money(o.delivery) + "\nমোট: " + KJ.money(o.total) +
      "\n\nনাম: " + o.customer.name + "\nফোন: " + o.customer.phone + "\nঠিকানা: " + o.customer.address + " (" + (o.customer.area === "inside" ? "ঢাকার ভেতরে" : "ঢাকার বাইরে") + ")" +
      "\nপেমেন্ট: " + adapters[o.payment.method].label + (o.payment.trxId ? "\nTrxID: " + o.payment.trxId + " (প্রেরক " + o.payment.senderNumber + ")" : "");
  };
  // অর্ডার সফল হলে এই হুক চলবে। সার্ভার থাকলে অর্ডার সার্ভারে পাঠায় (ব্যর্থ হলে ক্রেতাকে জানায়)।
  KJ.onOrderPlaced = function (order) {
    function local() { var list = KJ.store("kj_orders") || []; list.push(order); KJ.store("kj_orders", list); KJ.store("kj_last_order", order); }
    if (!CFG.apiBase || order.payment.status === "redirect") { local(); return Promise.resolve(); }
    return fetch(CFG.apiBase.replace(/\/$/, "") + "/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(order) })
      .catch(function () { throw new Error("সার্ভারে পৌঁছানো যায়নি, ইন্টারনেট দেখে আবার চেষ্টা করুন"); })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || "অর্ডার পাঠানো যায়নি"); order.number = j.number; order.total = j.total; local(); }); });
  };
})();
