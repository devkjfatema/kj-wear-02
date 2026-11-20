/* KJ Wear অ্যাডমিন: অর্ডার ও পণ্য ব্যবস্থাপনা */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); }, state = { cats: [], tab: "orders" };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var money = function (n) { return "৳" + Number(n || 0).toLocaleString("en-US"); };
  function toast(m) { var t = $("#toast"); t.textContent = m; t.classList.add("show"); setTimeout(function () { t.classList.remove("show"); }, 2200); }
  function api(path, opt) {
    opt = opt || {}; var o = { method: opt.method || "GET", headers: {}, credentials: "same-origin" };
    if (opt.json) { o.headers["Content-Type"] = "application/json"; o.body = JSON.stringify(opt.json); }
    if (opt.form) o.body = opt.form;
    return fetch(path, o).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (r.status === 401 && path !== "/api/admin/login") { showLogin(); throw new Error("লগইন করুন"); } if (!r.ok) throw new Error(j.error || "ত্রুটি হয়েছে"); return j; }); });
  }
  function showLogin() { $("#app").hidden = true; $("#login").hidden = false; }
  function showApp() { $("#login").hidden = true; $("#app").hidden = false; render(); }

  $("#loginForm").onsubmit = function (e) {
    e.preventDefault(); $("#lerr").textContent = "";
    api("/api/admin/login", { method: "POST", json: { username: $("#lu").value, password: $("#lp").value } }).then(boot).catch(function (x) { $("#lerr").textContent = x.message; });
  };
  $("#logout").onclick = function () { api("/api/admin/logout", { method: "POST" }).then(showLogin); };
  document.querySelectorAll("header nav button").forEach(function (b) { b.onclick = function () { state.tab = b.dataset.tab; document.querySelectorAll("header nav button").forEach(function (x) { x.classList.toggle("on", x === b); }); render(); }; });
  function boot() { return api("/api/admin/me").then(function (m) { state.cats = m.categories; showApp(); }).catch(showLogin); }
  function render() { (state.tab === "orders" ? orders : products)(); }

  /* ---------- অর্ডার ---------- */
  var ST = { new: "নতুন", confirmed: "নিশ্চিত", shipped: "পাঠানো হয়েছে", delivered: "পৌঁছেছে", cancelled: "বাতিল" };
  var PAY = { paid: ["পেমেন্ট হয়েছে", "paid"], cod: ["ক্যাশ অন ডেলিভারি", ""], pending_verification: ["TrxID মেলাতে হবে", "warn"], awaiting_payment: ["পেমেন্টের অপেক্ষায়", "warn"], failed: ["ব্যর্থ", "bad"] };
  function orders(filter) {
    $("#view").innerHTML = '<p class="muted">লোড হচ্ছে…</p>';
    api("/api/admin/orders" + (filter ? "?status=" + filter : "")).then(function (list) {
      var rows = list.map(function (o) {
        var p = PAY[o.pay_status] || [o.pay_status, ""], d = new Date(o.created_at);
        return '<tr data-id="' + o.id + '"><td><a href="#" data-open="' + o.id + '">' + esc(o.number) + '</a><br><span class="muted small">' + d.toLocaleString("bn-BD") + '</span></td>' +
          '<td>' + esc(o.customer_name) + '<br><span class="muted small">' + esc(o.phone) + '</span></td><td>' + money(o.total) + '</td>' +
          '<td>' + esc(o.pay_method) + '<br><span class="pill ' + p[1] + '">' + p[0] + '</span>' + (o.trx_id ? '<br><span class="small">TrxID: ' + esc(o.trx_id) + (o.sender_number ? " (" + esc(o.sender_number) + ")" : "") + '</span>' : '') +
          (o.pay_status === "pending_verification" ? '<br><button class="btn sm ghost" data-paid="' + o.id + '">পেমেন্ট মিলেছে</button>' : '') + '</td>' +
          '<td><select data-st="' + o.id + '" aria-label="অর্ডারের স্ট্যাটাস">' + Object.keys(ST).map(function (k) { return '<option value="' + k + '"' + (k === o.status ? " selected" : "") + '>' + ST[k] + '</option>'; }).join("") + '</select></td></tr>' +
          '<tr class="detail" id="d' + o.id + '" hidden><td colspan="5"><strong>ঠিকানা:</strong> ' + esc(o.address) + ' (' + (o.area === "inside" ? "ঢাকার ভেতরে" : "ঢাকার বাইরে") + ')' + (o.note ? '<br><strong>নোট:</strong> ' + esc(o.note) : '') +
          '<ul>' + o.items.map(function (i) { return '<li>' + esc(i.name) + ' (' + esc(i.color) + ', সাইজ ' + esc(i.size) + ') × ' + i.qty + ' = ' + (i.price == null ? "[দাম নেই]" : money(i.price * i.qty)) + '</li>'; }).join("") + '</ul>' +
          'সাবটোটাল ' + money(o.subtotal) + (o.discount ? ' | ছাড় −' + money(o.discount) + (o.coupon ? " (" + esc(o.coupon) + ")" : "") : "") + ' | ডেলিভারি ' + money(o.delivery) + ' | <strong>মোট ' + money(o.total) + '</strong></td></tr>';
      }).join("");
      $("#view").innerHTML = '<div class="bar"><h2>অর্ডার (' + list.length + ')</h2><select id="ofilter" aria-label="স্ট্যাটাস ফিল্টার"><option value="">সব</option>' + Object.keys(ST).map(function (k) { return '<option value="' + k + '"' + (k === filter ? " selected" : "") + '>' + ST[k] + '</option>'; }).join("") + '</select><button class="btn ghost sm" id="oref">রিফ্রেশ</button></div>' +
        (list.length ? '<div class="wrapx"><table class="tbl"><thead><tr><th>অর্ডার</th><th>ক্রেতা</th><th>মোট</th><th>পেমেন্ট</th><th>স্ট্যাটাস</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<p class="muted">এখনো কোনো অর্ডার নেই।</p>');
      $("#ofilter").onchange = function (e) { orders(e.target.value); }; $("#oref").onclick = function () { orders($("#ofilter").value); };
      document.querySelectorAll("[data-open]").forEach(function (a) { a.onclick = function (e) { e.preventDefault(); var d = $("#d" + a.dataset.open); d.hidden = !d.hidden; }; });
      document.querySelectorAll("[data-st]").forEach(function (s) { s.onchange = function () { api("/api/admin/orders/" + s.dataset.st, { method: "PATCH", json: { status: s.value } }).then(function () { toast("স্ট্যাটাস বদলেছে"); }).catch(function (x) { toast(x.message); }); }; });
      document.querySelectorAll("[data-paid]").forEach(function (b) { b.onclick = function () { api("/api/admin/orders/" + b.dataset.paid, { method: "PATCH", json: { pay_status: "paid" } }).then(function () { toast("পেমেন্ট নিশ্চিত"); orders($("#ofilter").value); }); }; });
    }).catch(function (x) { $("#view").innerHTML = '<p class="err">' + esc(x.message) + '</p>'; });
  }

  /* ---------- পণ্য ---------- */
  function products() {
    $("#view").innerHTML = '<p class="muted">লোড হচ্ছে…</p>';
    api("/api/admin/products").then(function (list) {
      state.products = list;
      var cname = function (id) { var c = state.cats.filter(function (x) { return x.id === id; })[0]; return c ? c.name : id; };
      $("#view").innerHTML = '<div class="bar"><h2>পণ্য (' + list.length + ')</h2><button class="btn" id="addP">নতুন পণ্য</button></div><div class="wrapx"><table class="tbl"><thead><tr><th></th><th>নাম</th><th>ক্যাটাগরি</th><th>দাম</th><th>অবস্থা</th><th></th></tr></thead><tbody>' +
        list.map(function (p) {
          var img = (p.colors[0].images || [])[0];
          return '<tr><td>' + (img ? '<img class="thumb" src="/' + esc(img) + '" alt="">' : '<span class="thumb"></span>') + '</td><td>' + esc(p.name) + '<br><span class="muted small">' + esc(p.id) + '</span></td><td>' + esc(cname(p.category)) + '</td><td>' + (p.price == null ? '<span class="muted">[দাম নেই]</span>' : money(p.price)) + '</td><td>' + (p.active ? '<span class="pill paid">চালু</span>' : '<span class="pill">লুকানো</span>') + '</td><td><button class="btn sm ghost" data-edit="' + esc(p.id) + '">সম্পাদনা</button></td></tr>';
        }).join("") + '</tbody></table></div>';
      $("#addP").onclick = function () { editor(null); };
      document.querySelectorAll("[data-edit]").forEach(function (b) { b.onclick = function () { editor(state.products.filter(function (p) { return p.id === b.dataset.edit; })[0]); }; });
    }).catch(function (x) { $("#view").innerHTML = '<p class="err">' + esc(x.message) + '</p>'; });
  }

  function editor(p) {
    var isNew = !p; p = p || { category: state.cats[0].id, name: "", price: null, sizes: ["M", "L", "XL"], colors: [{ name: "", hex: "#6B1F45", images: [] }], active: true };
    var colors = JSON.parse(JSON.stringify(p.colors)), m = $("#modal");
    function draw() {
      m.innerHTML = '<form class="mcard" id="pf"><h2>' + (isNew ? "নতুন পণ্য" : "পণ্য সম্পাদনা") + '</h2>' +
        '<div class="two"><div><label for="fn">নাম (বাংলা)</label><input id="fn" required value="' + esc(p.name) + '"></div><div><label for="fne">নাম (English, ঐচ্ছিক)</label><input id="fne" value="' + esc(p.nameEn) + '"></div></div>' +
        '<div class="three"><div><label for="fc">ক্যাটাগরি</label><select id="fc">' + state.cats.map(function (c) { return '<option value="' + esc(c.id) + '"' + (c.id === p.category ? " selected" : "") + '>' + esc(c.name) + '</option>'; }).join("") + '</select></div>' +
        '<div><label for="fp">দাম (৳)</label><input id="fp" type="number" min="0" value="' + (p.price == null ? "" : p.price) + '"></div><div><label for="fo">কাটা দাম (ঐচ্ছিক)</label><input id="fo" type="number" min="0" value="' + (p.oldPrice || "") + '"></div></div>' +
        '<div class="two"><div><label for="fs">সাইজ (কমা দিয়ে)</label><input id="fs" value="' + esc(p.sizes.join(", ")) + '"></div><div><label for="fb">ব্যাজ (যেমন: নতুন)</label><input id="fb" value="' + esc(p.badge) + '"></div></div>' +
        '<label for="fd">বর্ণনা</label><textarea id="fd" rows="3">' + esc(p.desc) + '</textarea><label for="fde">বর্ণনা (English, ঐচ্ছিক)</label><textarea id="fde" rows="2">' + esc(p.descEn) + '</textarea>' +
        '<div class="chk"><label><input type="checkbox" id="fa"' + (p.active !== false ? " checked" : "") + '> সাইটে দেখান</label><label><input type="checkbox" id="fnw"' + (p.isNew ? " checked" : "") + '> নতুন</label><label><input type="checkbox" id="ff"' + (p.featured ? " checked" : "") + '> হোমে ফিচার্ড</label></div>' +
        '<strong>রঙ ও ছবি</strong>' + colors.map(function (c, i) {
          return '<div class="color"><div class="three"><div><label>রঙের নাম</label><input data-cn="' + i + '" value="' + esc(c.name) + '"></div><div><label>রঙ</label><input type="color" data-ch="' + i + '" value="' + esc(c.hex) + '"></div><div><label>&nbsp;</label>' + (colors.length > 1 ? '<button type="button" class="btn sm ghost" data-cr="' + i + '">রঙ মুছুন</button>' : '') + '</div></div>' +
            '<div class="imgs">' + (c.images || []).map(function (u, j) { return '<div><img src="/' + esc(u) + '" alt=""><button type="button" aria-label="ছবি মুছুন" data-ir="' + i + ',' + j + '">×</button></div>'; }).join("") + '</div>' +
            '<label>ছবি যোগ করুন (JPG/PNG/WebP, ৮০০×১০০০ ভালো)</label><input type="file" accept="image/jpeg,image/png,image/webp" multiple data-up="' + i + '"><p class="muted small">ছবি না দিলে সাইটে প্লেসহোল্ডার দেখাবে।</p></div>';
        }).join("") + '<button type="button" class="btn sm ghost" id="addC">আরেকটা রঙ যোগ করুন</button>' +
        '<p class="err" id="perr" role="alert"></p><div class="bar" style="margin:1rem 0 0"><button class="btn">সেভ করুন</button><button type="button" class="btn ghost" id="pcancel">বাতিল</button><span class="grow"></span>' + (isNew ? "" : '<button type="button" class="btn danger sm" id="pdel">মুছুন</button>') + '</div></form>';
      bind();
    }
    function sync() { // ফর্মের মান ধরে রাখা
      colors.forEach(function (c, i) { var n = m.querySelector('[data-cn="' + i + '"]'), h = m.querySelector('[data-ch="' + i + '"]'); if (n) c.name = n.value; if (h) c.hex = h.value; });
      p = Object.assign({}, p, { name: $("#fn").value, nameEn: $("#fne").value, category: $("#fc").value, price: $("#fp").value, oldPrice: $("#fo").value, sizes: $("#fs").value.split(",").map(function (s) { return s.trim(); }).filter(Boolean), badge: $("#fb").value, desc: $("#fd").value, descEn: $("#fde").value, active: $("#fa").checked, isNew: $("#fnw").checked, featured: $("#ff").checked });
    }
    function bind() {
      $("#pcancel").onclick = function () { m.hidden = true; };
      $("#addC").onclick = function () { sync(); colors.push({ name: "", hex: "#888888", images: [] }); draw(); };
      m.querySelectorAll("[data-cr]").forEach(function (b) { b.onclick = function () { sync(); colors.splice(+b.dataset.cr, 1); draw(); }; });
      m.querySelectorAll("[data-ir]").forEach(function (b) { b.onclick = function () { sync(); var a = b.dataset.ir.split(","); colors[+a[0]].images.splice(+a[1], 1); draw(); }; });
      m.querySelectorAll("[data-up]").forEach(function (inp) {
        inp.onchange = function () {
          if (!inp.files.length) return; sync(); var f = new FormData(); Array.prototype.forEach.call(inp.files, function (x) { f.append("files", x); });
          toast("ছবি আপলোড হচ্ছে…");
          api("/api/admin/upload", { method: "POST", form: f }).then(function (r) { var c = colors[+inp.dataset.up]; c.images = (c.images || []).concat(r.urls); draw(); toast("ছবি যোগ হয়েছে"); }).catch(function (x) { toast(x.message); });
        };
      });
      var del = $("#pdel"); if (del) del.onclick = function () { if (del.dataset.sure) { api("/api/admin/products/" + encodeURIComponent(p.id), { method: "DELETE" }).then(function () { m.hidden = true; toast("মুছে গেছে"); products(); }); } else { del.dataset.sure = 1; del.textContent = "নিশ্চিত? আবার চাপুন"; } };
      $("#pf").onsubmit = function (e) {
        e.preventDefault(); sync();
        var body = Object.assign({}, p, { colors: colors }), req = isNew ? { method: "POST", json: body } : { method: "PUT", json: body };
        api("/api/admin/products" + (isNew ? "" : "/" + encodeURIComponent(p.id)), req).then(function () { m.hidden = true; toast("সেভ হয়েছে"); products(); }).catch(function (x) { $("#perr").textContent = x.message; });
      };
    }
    m.hidden = false; draw();
  }
  boot();
})();
