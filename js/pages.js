/* KJ Wear — পেজ রেন্ডার (home, shop, product, cart, checkout, confirmation) */
(function () {
  var KJ = window.KJ, CFG = KJ.cfg, main = KJ.$("#main"), page = document.body.dataset.page, P = window.KJ_PRODUCTS;
  var pages = {};

  /* ============ হোম ============ */
  pages.home = function () {
    var feat = P.filter(function (p) { return p.featured; }).slice(0, 8);
    var cats = CFG.categories.map(function (c, i) {
      var p = P.filter(function (x) { return x.category === c.id; })[0];
      return '<a class="cat-card reveal" href="shop.html?cat=' + c.id + '"><img src="' + (p ? KJ.images(p, i % p.colors.length)[0] : "") + '" alt=""><div><small>কালেকশন</small><h3>' + c.name + '</h3><span>' + KJ.esc(c.blurb) + '</span><em>দেখুন →</em></div></a>';
    }).join("");
    main.innerHTML =
      (function () {
        var h = CFG.hero || {}, bg = h.image ? "background-image:url('" + h.image + "')" : "";
        return '<section class="hero"><div class="hero-bg" style="' + bg + '" role="img" aria-label="' + KJ.esc(h.alt || CFG.brand.name) + '"></div><div class="hero-shade"></div>' +
          '<div class="wrap hero-inner"><div class="hero-copy"><p class="eyebrow">নতুন কালেকশন</p><h1>আপনার প্রতিটি দিনের জন্য <em>মার্জিত</em> পোশাক</h1><p class="lead">' + KJ.esc(CFG.brand.tagline) + '। বাছাই করা কাপড়, পরিপাটি সেলাই, সারা দেশে ডেলিভারি।</p>' +
          '<div class="hero-cta"><a class="btn" href="shop.html">কালেকশন দেখুন</a><a class="btn ghost" href="' + KJ.waLink("আসসালামু আলাইকুম, আমি অর্ডার করতে চাই।") + '" target="_blank" rel="noopener">WhatsApp এ অর্ডার</a></div>' +
          '<ul class="hero-points"><li>ক্যাশ অন ডেলিভারি</li><li>bKash ও Nagad</li><li>সারা বাংলাদেশে ডেলিভারি</li></ul></div></div>' + (h.image ? "" : '<span class="hero-hint">হিরো ছবি: images/hero.jpg</span>') + '</section>';
      })() +
      '<section class="section"><div class="wrap"><div class="sec-head reveal"><p class="eyebrow">কালেকশন</p><h2>আপনার পছন্দের ধরন বেছে নিন</h2></div><div class="cat-grid">' + cats + '</div></div></section>' +
      '<section class="section alt"><div class="wrap"><div class="sec-head row reveal"><div><p class="eyebrow">বাছাই করা</p><h2>ফিচার্ড পণ্য</h2></div><a class="link-btn" href="shop.html">সব পণ্য →</a></div><div class="grid" id="featGrid">' + feat.map(KJ.card).join("") + '</div></div></section>' +
      '<section class="section"><div class="wrap"><div class="sec-head reveal"><p class="eyebrow">কেন ' + KJ.esc(CFG.brand.name) + '</p><h2>ভরসার কারণ</h2></div><div class="why">' +
      [["বাছাই করা কাপড়", "আরামদায়ক ও টেকসই কাপড়, প্রতিটি পণ্য পাঠানোর আগে দেখা হয়।"], ["নিখুঁত সেলাই", "পরিপাটি ফিনিশিং ও ঠিক মাপ, যাতে পরলে আরাম পান।"], ["সহজ পেমেন্ট", "ক্যাশ অন ডেলিভারি, bKash, Nagad ও কার্ড।"], ["দ্রুত সাড়া", "যেকোনো প্রশ্নে WhatsApp এ সরাসরি কথা বলুন।"]].map(function (w) { return '<div class="why-item reveal"><i></i><h3>' + w[0] + '</h3><p>' + w[1] + '</p></div>'; }).join("") + '</div></div></section>' +
      '<section class="section alt"><div class="wrap"><div class="sec-head reveal"><p class="eyebrow">অর্ডার করবেন যেভাবে</p><h2>চারটি সহজ ধাপ</h2></div><ol class="steps">' +
      ["পণ্য বেছে নিন", "সাইজ ও রঙ ঠিক করে কার্টে দিন", "নাম, ঠিকানা ও পেমেন্ট দিন", "ঘরে বসে পণ্য বুঝে নিন"].map(function (s, i) { return '<li class="reveal"><span>' + KJ.bn(i + 1) + '</span>' + s + '</li>'; }).join("") + '</ol></div></section>' +
      '<section class="section"><div class="wrap"><div class="soon-band reveal"><div><p class="eyebrow">শীঘ্রই আসছে</p><h2>' + CFG.comingSoon.map(function (c) { return c.name; }).join(", ") + ' কালেকশন</h2><p>ছেলেদের পোশাক আসছে। আগে জানতে চাইলে WhatsApp এ জানিয়ে রাখুন।</p></div><a class="btn" href="' + KJ.waLink("Gents কালেকশন এলে আমাকে জানাবেন।") + '" target="_blank" rel="noopener">আমাকে জানান</a></div></div></section>';
    KJ.bindCards(main); KJ.reveal(main);
  };

  /* ============ শপ ============ */
  pages.shop = function () {
    var cat = KJ.param("cat") || "all", q = (KJ.param("q") || "").toLowerCase(), sort = "new";
    main.innerHTML = '<section class="page-head"><div class="wrap"><p class="eyebrow">শপ</p><h1 id="shopTitle">সব পণ্য</h1></div></section><section class="section tight"><div class="wrap">' +
      '<div class="toolbar"><div class="tabs" role="tablist" id="tabs"></div><div class="field inline"><label for="sort">সাজান</label><select id="sort"><option value="new">নতুন আগে</option><option value="low">দাম কম থেকে বেশি</option><option value="high">দাম বেশি থেকে কম</option></select></div></div>' +
      '<p class="muted" id="resultInfo"></p><div class="grid" id="shopGrid"></div></div></section>';
    var tabs = [{ id: "all", name: "সব" }].concat(CFG.categories);
    KJ.$("#tabs").innerHTML = tabs.map(function (t) { return '<button role="tab" data-t="' + t.id + '">' + t.name + '</button>'; }).join("");
    function draw() {
      KJ.$$("#tabs button").forEach(function (b) { b.classList.toggle("on", b.dataset.t === cat); b.setAttribute("aria-selected", b.dataset.t === cat); });
      var list = P.filter(function (p) { return (cat === "all" || p.category === cat) && (!q || (p.name + " " + KJ.catName(p.category)).toLowerCase().indexOf(q) > -1); });
      list = list.slice().sort(function (a, b) { return sort === "low" ? (a.price || 0) - (b.price || 0) : sort === "high" ? (b.price || 0) - (a.price || 0) : (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0); });
      KJ.$("#shopTitle").textContent = q ? "\"" + KJ.param("q") + "\" এর ফলাফল" : cat === "all" ? "সব পণ্য" : KJ.catName(cat);
      KJ.$("#resultInfo").textContent = KJ.bn(list.length) + "টি পণ্য";
      var g = KJ.$("#shopGrid"); g.classList.add("fade"); setTimeout(function () {
        g.innerHTML = list.length ? list.map(KJ.card).join("") : '<div class="empty wide"><p>কোনো পণ্য পাওয়া যায়নি।</p><a class="btn" href="shop.html">সব পণ্য দেখুন</a></div>';
        KJ.bindCards(g); g.classList.remove("fade");
      }, 160);
    }
    KJ.$$("#tabs button").forEach(function (b) { b.onclick = function () { cat = b.dataset.t; draw(); }; });
    KJ.$("#sort").onchange = function (e) { sort = e.target.value; draw(); };
    draw();
  };

  /* ============ পণ্য ============ */
  pages.product = function () {
    var p = KJ.product(KJ.param("id"));
    if (!p) { main.innerHTML = '<section class="section"><div class="wrap"><div class="empty"><p>পণ্যটি পাওয়া যায়নি।</p><a class="btn" href="shop.html">সব পণ্য দেখুন</a></div></div></section>'; return; }
    var ci = 0, size = p.sizes[0], qty = 1, imgIdx = 0;
    document.title = p.name + " | " + CFG.brand.name;
    KJ.setWaMessage("আসসালামু আলাইকুম, আমি \"" + p.name + "\" সম্পর্কে জানতে চাই।\n" + location.href);
    var rel = P.filter(function (x) { return x.category === p.category && x.id !== p.id; }).slice(0, 4);
    main.innerHTML = '<section class="section tight"><div class="wrap"><nav class="crumbs" aria-label="পথ"><a href="index.html">হোম</a> / <a href="shop.html?cat=' + p.category + '">' + KJ.catName(p.category) + '</a> / <span>' + KJ.esc(p.name) + '</span></nav>' +
      '<div class="pdp"><div class="gallery"><div class="g-main"><img id="gMain" alt="' + KJ.esc(p.name) + '"></div><div class="g-thumbs" id="gThumbs"></div></div>' +
      '<div class="pinfo"><p class="eyebrow">' + KJ.catName(p.category) + '</p><h1>' + KJ.esc(p.name) + '</h1><div class="price big"><strong>' + KJ.priceText(p.price) + '</strong>' + (p.oldPrice ? '<s>' + KJ.money(p.oldPrice) + '</s>' : '') + '</div><p class="desc">' + KJ.esc(p.desc) + '</p>' +
      '<div class="opt"><span class="opt-label">রঙ: <b id="colorName"></b></span><div class="swatches" id="swatches"></div></div>' +
      '<div class="opt"><span class="opt-label">সাইজ</span><div class="sizes" id="sizes"></div><button class="link-btn" id="guideBtn" type="button">সাইজ গাইড</button></div>' +
      '<div class="opt"><span class="opt-label">পরিমাণ</span><div class="qty big"><button id="qm" aria-label="কমান">−</button><span id="qv">১</span><button id="qp" aria-label="বাড়ান">+</button></div></div>' +
      '<div class="pdp-cta"><button class="btn" id="addBtn">কার্টে যোগ করুন</button><button class="btn ghost" id="buyBtn">এখনই কিনুন</button></div>' +
      '<ul class="assure"><li>ক্যাশ অন ডেলিভারি</li><li>bKash / Nagad</li><li>WhatsApp এ সাহায্য</li></ul></div></div>' +
      (rel.length ? '<div class="sec-head reveal related"><h2>আরও দেখুন</h2></div><div class="grid">' + rel.map(KJ.card).join("") + '</div>' : '') + '</div></section>';
    function drawImgs() { var im = KJ.images(p, ci); KJ.$("#gMain").src = im[imgIdx] || im[0]; KJ.$("#gThumbs").innerHTML = im.map(function (s, i) { return '<button class="' + (i === imgIdx ? "on" : "") + '" data-i="' + i + '" aria-label="ছবি ' + KJ.bn(i + 1) + '"><img src="' + s + '" alt=""></button>'; }).join(""); KJ.$$("#gThumbs button").forEach(function (b) { b.onclick = function () { imgIdx = +b.dataset.i; drawImgs(); }; }); }
    function drawOpts() {
      KJ.$("#colorName").textContent = p.colors[ci].name;
      KJ.$("#swatches").innerHTML = p.colors.map(function (c, i) { return '<button class="sw' + (i === ci ? " on" : "") + '" data-i="' + i + '" style="--c:' + c.hex + '" aria-label="' + KJ.esc(c.name) + '" title="' + KJ.esc(c.name) + '"></button>'; }).join("");
      KJ.$("#sizes").innerHTML = p.sizes.map(function (s) { return '<button class="sz' + (s === size ? " on" : "") + '" data-s="' + s + '">' + KJ.bn(s) + '</button>'; }).join("");
      KJ.$$(".sw").forEach(function (b) { b.onclick = function () { ci = +b.dataset.i; imgIdx = 0; drawOpts(); drawImgs(); }; });
      KJ.$$(".sz").forEach(function (b) { b.onclick = function () { size = b.dataset.s; drawOpts(); }; });
    }
    drawOpts(); drawImgs();
    KJ.$("#qm").onclick = function () { qty = Math.max(1, qty - 1); KJ.$("#qv").textContent = KJ.bn(qty); };
    KJ.$("#qp").onclick = function () { qty = Math.min(20, qty + 1); KJ.$("#qv").textContent = KJ.bn(qty); };
    KJ.$("#addBtn").onclick = function () { KJ.cart.add(p.id, p.colors[ci].name, size, qty); };
    KJ.$("#buyBtn").onclick = function () { KJ.cart.add(p.id, p.colors[ci].name, size, qty, false); location.href = "checkout.html"; };
    KJ.$("#guideBtn").onclick = function () { sizeGuide(p); };
    KJ.bindCards(main);
  };
  function sizeGuide(p) {
    var bork = p.category === "borkha";
    var rows = bork ? [["৫২", "৫২ ইঞ্চি"], ["৫৪", "৫৪ ইঞ্চি"], ["৫৬", "৫৬ ইঞ্চি"], ["৫৮", "৫৮ ইঞ্চি"]] : [["M", "[বুক ৩৮]"], ["L", "[বুক ৪০]"], ["XL", "[বুক ৪২]"], ["XXL", "[বুক ৪৪]"]];
    var m = document.createElement("div"); m.className = "modal"; m.innerHTML = '<div class="modal-card" role="dialog" aria-label="সাইজ গাইড"><button class="icon-btn close" aria-label="বন্ধ করুন">✕</button><h3>সাইজ গাইড</h3><p class="muted small">নিজের মাপের সঙ্গে মিলিয়ে নিন। মাপ নিয়ে সন্দেহ থাকলে WhatsApp এ জানান।</p><table><thead><tr><th>সাইজ</th><th>' + (bork ? "দৈর্ঘ্য" : "মাপ") + '</th></tr></thead><tbody>' + rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join("") + '</tbody></table></div>';
    document.body.appendChild(m); requestAnimationFrame(function () { m.classList.add("show"); });
    function close() { m.classList.remove("show"); setTimeout(function () { m.remove(); }, 200); }
    m.onclick = function (e) { if (e.target === m) close(); }; KJ.$(".close", m).onclick = close;
  }

  /* ============ কার্ট ============ */
  pages.cart = function () {
    main.innerHTML = '<section class="page-head"><div class="wrap"><p class="eyebrow">কেনাকাটা</p><h1>আপনার কার্ট</h1></div></section><section class="section tight"><div class="wrap" id="cartWrap"></div></section>';
    function draw() {
      var it = KJ.cart.items(), w = KJ.$("#cartWrap");
      if (!it.length) { w.innerHTML = '<div class="empty"><p>আপনার কার্ট এখন খালি।</p><a class="btn" href="shop.html">কেনাকাটা শুরু করুন</a></div>'; return; }
      w.innerHTML = '<div class="cart-grid"><div class="cart-lines">' + it.map(function (i, x) { return KJ.lineHtml(i, x, true); }).join("") + '</div><aside class="summary"><h3>সারসংক্ষেপ</h3><div class="row"><span>সাবটোটাল</span><strong>' + KJ.money(KJ.cart.subtotal()) + '</strong></div><p class="muted small">ডেলিভারি চার্জ চেকআউটে যোগ হবে।</p><a class="btn block" href="checkout.html">চেকআউট করুন</a><a class="link-btn center" href="shop.html">আরও কিনুন</a></aside></div>';
      KJ.bindLines(w);
    }
    KJ.onCartChange = draw; draw();
  };

  /* ============ চেকআউট ============ */
  pages.checkout = function () {
    var coupon = null, area = "inside", method = null;
    var pays = KJ.payments.list();
    main.innerHTML = '<section class="page-head"><div class="wrap"><p class="eyebrow">চেকআউট</p><h1>অর্ডার সম্পন্ন করুন</h1></div></section><section class="section tight"><div class="wrap" id="coWrap"></div></section>';
    function totals() {
      var sub = KJ.cart.subtotal(), disc = 0;
      if (coupon) disc = coupon.type === "percent" ? Math.round(sub * coupon.value / 100) : Math.min(coupon.value, sub);
      var del = area === "inside" ? CFG.delivery.insideDhaka : CFG.delivery.outsideDhaka;
      if (CFG.delivery.freeOver && sub >= CFG.delivery.freeOver) del = 0;
      return { sub: sub, disc: disc, del: del, total: sub - disc + del };
    }
    function summaryHtml() {
      var t = totals();
      return '<h3>অর্ডার সামারি</h3><div class="lines">' + KJ.cart.items().map(function (i) { return KJ.lineHtml(i, 0, false); }).join("") + '</div>' +
        '<div class="coupon"><label class="sr" for="cp">কুপন কোড</label><input id="cp" placeholder="কুপন কোড" value="' + (coupon ? KJ.esc(coupon.code) : "") + '"><button type="button" class="btn small ghost" id="cpBtn">প্রয়োগ</button></div><p class="muted small" id="cpMsg"></p>' +
        '<div class="row"><span>সাবটোটাল</span><span>' + KJ.money(t.sub) + '</span></div>' + (t.disc ? '<div class="row"><span>ছাড়</span><span>−' + KJ.money(t.disc) + '</span></div>' : '') +
        '<div class="row"><span>ডেলিভারি</span><span>' + (t.del ? KJ.money(t.del) : "ফ্রি") + '</span></div><div class="row total"><span>মোট</span><strong>' + KJ.money(t.total) + '</strong></div>' +
        (KJ.cart.items().some(function (i) { var p = KJ.product(i.id); return p && p.price == null; }) ? '<p class="muted small">কিছু পণ্যের দাম এখনো দেওয়া হয়নি, তাই মোট কম দেখাচ্ছে।</p>' : '');
    }
    function refresh() { var s = KJ.$("#sumBox"); if (s) { s.innerHTML = summaryHtml(); bindSummary(); } }
    function bindSummary() {
      KJ.$("#cpBtn").onclick = function () { var c = KJ.$("#cp").value.trim().toUpperCase(), d = CFG.coupons[c]; if (d) { coupon = { code: c, type: d.type, value: d.value }; refresh(); KJ.$("#cpMsg").textContent = "কুপন প্রয়োগ হয়েছে।"; } else { coupon = null; refresh(); KJ.$("#cpMsg").textContent = "কুপনটি সঠিক নয়।"; } };
    }
    function draw() {
      var w = KJ.$("#coWrap");
      if (!KJ.cart.items().length) { w.innerHTML = '<div class="empty"><p>কার্ট খালি। আগে পণ্য যোগ করুন।</p><a class="btn" href="shop.html">কেনাকাটা শুরু করুন</a></div>'; return; }
      method = method || (pays[0] && pays[0].id);
      w.innerHTML = '<form class="co-grid" id="coForm" novalidate><div class="co-main">' +
        '<fieldset><legend>ডেলিভারির তথ্য</legend><div class="two"><div class="field"><label for="cName">নাম</label><input id="cName" autocomplete="name" required></div><div class="field"><label for="cPhone">মোবাইল নম্বর</label><input id="cPhone" inputmode="numeric" autocomplete="tel" placeholder="01XXXXXXXXX" required></div></div>' +
        '<div class="field"><label for="cArea">ডেলিভারি এলাকা</label><select id="cArea"><option value="inside">ঢাকার ভেতরে (' + KJ.money(CFG.delivery.insideDhaka) + ')</option><option value="outside">ঢাকার বাইরে (' + KJ.money(CFG.delivery.outsideDhaka) + ')</option></select></div>' +
        '<div class="field"><label for="cAddr">পূর্ণ ঠিকানা</label><textarea id="cAddr" rows="3" autocomplete="street-address" placeholder="বাসা/রাস্তা, থানা, জেলা" required></textarea></div><div class="field"><label for="cNote">নোট (ঐচ্ছিক)</label><input id="cNote"></div></fieldset>' +
        '<fieldset><legend>পেমেন্ট পদ্ধতি</legend><div class="pay-list">' + pays.map(function (m) { return '<label class="pay-opt' + (m.ready ? "" : " off") + '"><input type="radio" name="pay" value="' + m.id + '"' + (m.id === method ? " checked" : "") + (m.ready ? "" : " disabled") + '><span>' + KJ.esc(m.label) + (m.ready ? "" : " <em>শীঘ্রই</em>") + '</span></label>'; }).join("") + '</div><div id="payFields">' + (method ? KJ.payments.fields(method) : "") + '</div></fieldset><p class="form-err" id="err" role="alert"></p></div>' +
        '<aside class="summary" id="sumBox">' + summaryHtml() + '</aside><div class="co-submit"><button class="btn block" id="placeBtn" type="submit">অর্ডার করুন</button></div></form>';
      bindSummary();
      KJ.$("#cArea").value = area; KJ.$("#cArea").onchange = function (e) { area = e.target.value; refresh(); };
      KJ.$$("input[name=pay]").forEach(function (r) { r.onchange = function () { method = r.value; KJ.$("#payFields").innerHTML = KJ.payments.fields(method); KJ.$("#err").textContent = ""; }; });
      KJ.$("#coForm").onsubmit = submit;
    }
    function submit(e) {
      e.preventDefault(); var err = KJ.$("#err"); err.textContent = "";
      var name = KJ.$("#cName").value.trim(), phone = KJ.$("#cPhone").value.trim(), addr = KJ.$("#cAddr").value.trim();
      if (name.length < 2) return fail("আপনার নাম লিখুন", "#cName");
      if (!/^01[3-9]\d{8}$/.test(phone.replace(/[০-৯]/g, function (d) { return "০১২৩৪৫৬৭৮৯".indexOf(d); }))) return fail("সঠিক মোবাইল নম্বর দিন (১১ ডিজিট)", "#cPhone");
      if (addr.length < 8) return fail("পূর্ণ ঠিকানা লিখুন", "#cAddr");
      if (!method) return fail("একটি পেমেন্ট পদ্ধতি বেছে নিন");
      var t = totals();
      var order = {
        number: "KJ" + Date.now().toString().slice(-8), createdAt: new Date().toISOString(),
        items: KJ.cart.items().map(function (i) { var p = KJ.product(i.id); return { id: i.id, name: p.name, color: i.color, size: i.size, qty: i.qty, price: p.price }; }),
        subtotal: t.sub, discount: t.disc, delivery: t.del, total: t.total, coupon: coupon ? coupon.code : null,
        customer: { name: name, phone: phone, area: area, address: addr, note: KJ.$("#cNote").value.trim() },
        payment: { method: method }, status: "new"
      };
      var btn = KJ.$("#placeBtn"); btn.disabled = true; btn.textContent = "অর্ডার হচ্ছে…";
      KJ.payments.process(method, order).then(function (r) {
        order.payment.status = r.status; if (r.ref) order.payment.ref = r.ref;
        return Promise.resolve(KJ.onOrderPlaced(order)).then(function () {
          if (r.status === "redirect" && r.url) { location.href = r.url; return; }
          KJ.cart.clear(); location.href = "confirmation.html";
        });
      }).catch(function (x) { btn.disabled = false; btn.textContent = "অর্ডার করুন"; fail(x.message || "কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন"); });
    }
    function fail(msg, sel) { KJ.$("#err").textContent = msg; if (sel) KJ.$(sel).focus(); return false; }
    KJ.onCartChange = function () { if (!KJ.cart.items().length) draw(); };
    draw();
    if (KJ.param("payment") === "failed") KJ.$("#err") && (KJ.$("#err").textContent = "পেমেন্ট সম্পন্ন হয়নি। আবার চেষ্টা করুন বা অন্য পদ্ধতি বেছে নিন।");
  };

  /* ============ নিশ্চিতকরণ ============ */
  pages.confirmation = function () {
    var o = KJ.store("kj_last_order");
    if (!o) { main.innerHTML = '<section class="section"><div class="wrap"><div class="empty"><p>কোনো অর্ডার পাওয়া যায়নি।</p><a class="btn" href="shop.html">কেনাকাটা করুন</a></div></div></section>'; return; }
    if (KJ.param("order")) KJ.cart.clear();
    var msg = KJ.orderSummary(o), pend = o.payment.status === "pending";
    main.innerHTML = '<section class="section"><div class="wrap narrow confirm"><div class="tick" aria-hidden="true"><svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5 9-10"/></svg></div><p class="eyebrow">ধন্যবাদ, ' + KJ.esc(o.customer.name) + '</p><h1>আপনার অর্ডার পাওয়া গেছে</h1><p class="lead">অর্ডার নম্বর <strong class="num">' + o.number + '</strong>। ' + (pend ? "আমরা আপনার TrxID মিলিয়ে দেখে অর্ডার নিশ্চিত করব।" : "খুব শীঘ্রই ফোনে যোগাযোগ করা হবে।") + '</p>' +
      '<pre class="order-pre">' + KJ.esc(msg) + '</pre><div class="hero-cta"><a class="btn" id="waSend" target="_blank" rel="noopener" href="' + KJ.waLink(msg) + '">WhatsApp এ অর্ডার সামারি পাঠান</a><a class="btn ghost" href="shop.html">আরও কেনাকাটা</a></div></div></section>';
  };

  (pages[page] || pages.home)();
  KJ.reveal(document);
})();
