/* KJ Wear — মূল ফাংশন: কার্ট, হেডার, ফুটার, ড্রয়ার, অ্যানিমেশন */
(function () {
  var CFG = window.KJ_CONFIG, KJ = (window.KJ = {});
  KJ.cfg = CFG;
  document.title = document.title.replace("KJ Wear", CFG.brand.name);

  /* ---------- হেল্পার ---------- */
  var BN = "০১২৩৪৫৬৭৮৯";
  KJ.bn = function (n) { return String(n).replace(/\d/g, function (d) { return BN[d]; }); };
  KJ.money = function (n) { return CFG.currency + KJ.bn(Math.round(n).toLocaleString("en-US")); };
  KJ.priceText = function (p) { return p == null ? "[দাম]" : KJ.money(p); };
  KJ.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };
  KJ.$ = function (s, r) { return (r || document).querySelector(s); };
  KJ.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  KJ.param = function (k) { return new URLSearchParams(location.search).get(k); };
  KJ.product = function (id) { return window.KJ_PRODUCTS.filter(function (p) { return p.id === id; })[0]; };
  KJ.catName = function (id) { var c = CFG.categories.filter(function (x) { return x.id === id; })[0]; return c ? c.name : id; };
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  KJ.store = store;

  /* ---------- প্লেসহোল্ডার ছবি ---------- */
  KJ.placeholder = function (label, hex, tag) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + hex + '" stop-opacity=".92"/><stop offset="1" stop-color="' + hex + '" stop-opacity=".62"/></linearGradient></defs>' +
      '<rect width="600" height="750" fill="url(#g)"/><path d="M300 170c-34 0-52 30-52 30l-84 42 28 70 40-18v236h136V294l40 18 28-70-84-42s-18-30-52-30z" fill="none" stroke="#F7F1E5" stroke-opacity=".55" stroke-width="3"/>' +
      '<text x="300" y="610" text-anchor="middle" font-family="serif" font-size="30" fill="#F7F1E5">' + KJ.esc(label) + '</text>' +
      '<text x="300" y="652" text-anchor="middle" font-family="sans-serif" font-size="20" letter-spacing="4" fill="#F7F1E5" fill-opacity=".75">' + KJ.esc(tag || "ছবি যোগ করুন") + '</text></svg>';
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  };
  KJ.images = function (p, ci) {
    var c = p.colors[ci || 0] || p.colors[0];
    if (c && c.images && c.images.length) return c.images;
    return [KJ.placeholder(p.name, c.hex, c.name), KJ.placeholder(p.name, c.hex, "পাশের দিক"), KJ.placeholder(p.name, c.hex, "ডিটেইল")];
  };

  /* ---------- কার্ট ---------- */
  var cart = store("kj_cart") || [];
  KJ.cart = {
    items: function () { return cart; },
    save: function () { store("kj_cart", cart); KJ.renderCart(); },
    count: function () { return cart.reduce(function (s, i) { return s + i.qty; }, 0); },
    subtotal: function () { return cart.reduce(function (s, i) { var p = KJ.product(i.id); return s + (p && p.price ? p.price * i.qty : 0); }, 0); },
    add: function (id, color, size, qty, open) {
      var p = KJ.product(id); if (!p) return;
      color = color || p.colors[0].name; size = size || p.sizes[0]; qty = qty || 1;
      var f = cart.filter(function (i) { return i.id === id && i.color === color && i.size === size; })[0];
      if (f) f.qty += qty; else cart.push({ id: id, color: color, size: size, qty: qty });
      KJ.cart.save(); KJ.toast(p.name + " কার্টে যোগ হয়েছে");
      var b = KJ.$("#cartBtn"); if (b) { b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
      if (open !== false) KJ.openDrawer();
    },
    setQty: function (idx, q) { if (q < 1) cart.splice(idx, 1); else cart[idx].qty = Math.min(q, 20); KJ.cart.save(); },
    remove: function (idx) { cart.splice(idx, 1); KJ.cart.save(); },
    clear: function () { cart = []; KJ.cart.save(); }
  };

  KJ.lineHtml = function (i, idx, editable) {
    var p = KJ.product(i.id); if (!p) return "";
    var ci = Math.max(0, p.colors.map(function (c) { return c.name; }).indexOf(i.color));
    var img = KJ.images(p, ci)[0];
    return '<div class="line"><img src="' + img + '" alt="' + KJ.esc(p.name) + '"><div class="line-info"><a href="product.html?id=' + p.id + '">' + KJ.esc(p.name) + '</a>' +
      '<small>' + KJ.esc(i.color) + ' · সাইজ ' + KJ.esc(KJ.bn(i.size)) + '</small><strong>' + KJ.priceText(p.price) + '</strong></div>' +
      (editable ? '<div class="line-ctl"><div class="qty"><button aria-label="কমান" data-q="-1" data-i="' + idx + '">−</button><span>' + KJ.bn(i.qty) + '</span><button aria-label="বাড়ান" data-q="1" data-i="' + idx + '">+</button></div><button class="link-btn" data-rm="' + idx + '">মুছুন</button></div>' : '<span class="line-qty">× ' + KJ.bn(i.qty) + '</span>') + '</div>';
  };
  KJ.bindLines = function (root) {
    KJ.$$("[data-q]", root).forEach(function (b) { b.onclick = function () { var i = +b.dataset.i; KJ.cart.setQty(i, cart[i].qty + +b.dataset.q); }; });
    KJ.$$("[data-rm]", root).forEach(function (b) { b.onclick = function () { KJ.cart.remove(+b.dataset.rm); }; });
  };
  KJ.renderCart = function () {
    var c = KJ.cart.count();
    KJ.$$(".cart-count").forEach(function (e) { e.textContent = KJ.bn(c); e.hidden = !c; });
    var body = KJ.$("#drawerBody"), foot = KJ.$("#drawerFoot");
    if (body) {
      body.innerHTML = cart.length ? cart.map(function (i, x) { return KJ.lineHtml(i, x, true); }).join("") :
        '<div class="empty"><p>আপনার কার্ট এখন খালি।</p><a class="btn" href="shop.html">কেনাকাটা শুরু করুন</a></div>';
      KJ.bindLines(body);
      foot.hidden = !cart.length;
      KJ.$("#drawerTotal").textContent = KJ.money(KJ.cart.subtotal());
    }
    if (KJ.onCartChange) KJ.onCartChange();
  };

  /* ---------- UI: হেডার/ফুটার/ড্রয়ার ---------- */
  var ICON = {
    bag: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    mic: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>',
    wa: '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.700 6.700 0 0 1-3.300-2.900c-.2-.4.2-.4.700-1.300.1-.2 0-.3 0-.5l-.8-1.800c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.200c0 1.300.9 2.500 1 2.700.1.200 1.800 2.800 4.400 3.900 1.600.7 2.300.7 3.100.6.500-.1 1.500-.6 1.700-1.200.2-.6.2-1.100.2-1.200-.1-.2-.3-.2-.5-.3z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 5h16v11H9l-5 4V5z"/><path d="M8 9h8M8 12h5"/></svg>'
  };
  KJ.icon = ICON;
  KJ.logo = function (light) {
    return '<a class="logo' + (light ? " light" : "") + '" href="index.html" aria-label="' + KJ.esc(CFG.brand.name) + '"><span class="logo-mark">' + KJ.esc(CFG.brand.mark) + '<i></i></span><span class="logo-word">' + KJ.esc(CFG.brand.name.replace(/\s+/g, " ").toUpperCase().split("").join(" ")) + '</span></a>';
  };
  KJ.waLink = function (text) { return "https://wa.me/" + CFG.whatsapp.replace(/\D/g, "") + (text ? "?text=" + encodeURIComponent(text) : ""); };

  function buildChrome() {
    var cats = CFG.categories.map(function (c) { return '<a href="shop.html?cat=' + c.id + '">' + c.name + '</a>'; }).join("");
    var soon = CFG.comingSoon.map(function (c) { return '<span class="soon">' + c.name + ' <em>শীঘ্রই</em></span>'; }).join("");
    KJ.$("#app-header").innerHTML =
      '<header class="site-header" id="siteHeader"><div class="wrap head-row">' +
      '<button class="icon-btn menu-btn" id="menuBtn" aria-label="মেনু" aria-expanded="false"><span></span><span></span><span></span></button>' + KJ.logo() +
      '<nav class="main-nav" id="mainNav" aria-label="প্রধান মেনু"><a href="index.html">হোম</a><a href="shop.html">সব পণ্য</a>' + cats + soon + '</nav>' +
      '<form class="search" id="searchForm" role="search"><label class="sr" for="q">পণ্য খুঁজুন</label><input id="q" type="search" placeholder="পণ্য খুঁজুন…" autocomplete="off"><button type="button" class="icon-btn mic" id="micSearch" aria-label="ভয়েস দিয়ে খুঁজুন" hidden>' + ICON.mic + '</button><button class="icon-btn" aria-label="খুঁজুন">' + ICON.search + '</button></form>' +
      '<button class="icon-btn cart-btn" id="cartBtn" aria-label="কার্ট খুলুন">' + ICON.bag + '<span class="cart-count" hidden>০</span></button></div></header>';
    KJ.$("#app-footer").innerHTML =
      '<footer class="site-footer"><div class="wrap foot-grid"><div>' + KJ.logo(true) + '<p>' + KJ.esc(CFG.brand.tagline) + '</p></div>' +
      '<div><h4>কেনাকাটা</h4><a href="shop.html">সব পণ্য</a>' + cats + '<a href="cart.html">কার্ট</a></div>' +
      '<div><h4>যোগাযোগ</h4><a href="' + KJ.waLink() + '" target="_blank" rel="noopener">WhatsApp</a>' +
      (CFG.messenger ? '<a href="https://m.me/' + CFG.messenger + '" target="_blank" rel="noopener">Messenger</a>' : '') +
      (CFG.email ? '<a href="mailto:' + CFG.email + '">' + CFG.email + '</a>' : '') + '</div>' +
      '<div><h4>পেমেন্ট</h4><div class="pay-chips"><span>ক্যাশ অন ডেলিভারি</span><span>bKash</span><span>Nagad</span><span>Visa</span><span>Mastercard</span></div></div></div>' +
      '<div class="wrap foot-base">© ' + KJ.bn(new Date().getFullYear()) + ' ' + KJ.esc(CFG.brand.name) + '। সর্বস্বত্ব সংরক্ষিত।</div></footer>';
    KJ.$("#app-overlays").innerHTML =
      '<div class="scrim" id="scrim" hidden></div>' +
      '<aside class="drawer" id="drawer" aria-label="কার্ট" aria-hidden="true"><div class="drawer-head"><h3>আপনার কার্ট</h3><button class="icon-btn" id="drawerClose" aria-label="বন্ধ করুন">✕</button></div>' +
      '<div class="drawer-body" id="drawerBody"></div><div class="drawer-foot" id="drawerFoot" hidden><div class="row"><span>সাবটোটাল</span><strong id="drawerTotal"></strong></div><p class="muted small">ডেলিভারি চার্জ চেকআউটে যোগ হবে।</p><a class="btn block" href="checkout.html">চেকআউট করুন</a><a class="link-btn center" href="cart.html">পুরো কার্ট দেখুন</a></div></aside>' +
      '<div class="toast" id="toast" role="status" aria-live="polite"></div>' +
      '<div class="float-stack"><button class="fab ai" id="aiBtn" aria-label="AI অ্যাসিস্ট্যান্ট">' + ICON.chat + '</button><a class="fab wa" id="waBtn" href="' + KJ.waLink("আসসালামু আলাইকুম, আমি " + CFG.brand.name + " থেকে জানতে চাই।") + '" target="_blank" rel="noopener" aria-label="WhatsApp এ মেসেজ করুন">' + ICON.wa + '</a></div>';

    var mb = KJ.$("#menuBtn"), nav = KJ.$("#mainNav");
    mb.onclick = function () { var o = nav.classList.toggle("open"); mb.setAttribute("aria-expanded", o); };
    KJ.$("#cartBtn").onclick = KJ.openDrawer;
    KJ.$("#drawerClose").onclick = KJ.closeDrawer; KJ.$("#scrim").onclick = KJ.closeDrawer;
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") KJ.closeDrawer(); });
    var q = KJ.param("q"); if (q) KJ.$("#q").value = q;
    KJ.$("#searchForm").onsubmit = function (e) { e.preventDefault(); var v = KJ.$("#q").value.trim(); location.href = "shop.html" + (v ? "?q=" + encodeURIComponent(v) : ""); };
    var h = KJ.$("#siteHeader"); window.addEventListener("scroll", function () { h.classList.toggle("scrolled", window.scrollY > 20); }, { passive: true });

    // WhatsApp বাটন: পণ্য পেজে পণ্যের নামসহ
    KJ.setWaMessage = function (t) { KJ.$("#waBtn").href = KJ.waLink(t); };
  }
  KJ.openDrawer = function () { KJ.$("#drawer").classList.add("open"); KJ.$("#drawer").setAttribute("aria-hidden", "false"); var s = KJ.$("#scrim"); s.hidden = false; requestAnimationFrame(function () { s.classList.add("show"); }); document.body.classList.add("lock"); };
  KJ.closeDrawer = function () { var d = KJ.$("#drawer"); d.classList.remove("open"); d.setAttribute("aria-hidden", "true"); var s = KJ.$("#scrim"); s.classList.remove("show"); setTimeout(function () { s.hidden = true; }, 300); document.body.classList.remove("lock"); };
  var tt; KJ.toast = function (m) { var t = KJ.$("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove("show"); }, 2400); };

  /* ---------- স্ক্রল রিভিল ---------- */
  KJ.reveal = function (root) {
    var els = KJ.$$(".reveal:not(.in)", root);
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { threshold: 0.12 });
    els.forEach(function (e, i) { e.style.transitionDelay = (i % 4) * 70 + "ms"; io.observe(e); });
  };

  /* ---------- পণ্য কার্ড ---------- */
  KJ.card = function (p) {
    var imgs = KJ.images(p, 0);
    var dots = p.colors.map(function (c, i) { return '<button class="dot" type="button" data-pid="' + p.id + '" data-ci="' + i + '" style="--c:' + c.hex + '" aria-label="' + KJ.esc(c.name) + '" title="' + KJ.esc(c.name) + '"></button>'; }).join("");
    return '<article class="card reveal" data-id="' + p.id + '"><a class="card-img" href="product.html?id=' + p.id + '"><img src="' + imgs[0] + '" alt="' + KJ.esc(p.name) + '" loading="lazy">' + (p.badge ? '<span class="badge">' + KJ.esc(p.badge) + '</span>' : '') + '</a>' +
      '<div class="card-body"><small>' + KJ.catName(p.category) + '</small><h3><a href="product.html?id=' + p.id + '">' + KJ.esc(p.name) + '</a></h3>' +
      '<div class="price"><strong>' + KJ.priceText(p.price) + '</strong>' + (p.oldPrice ? '<s>' + KJ.money(p.oldPrice) + '</s>' : '') + '</div>' +
      '<div class="card-foot"><div class="dots">' + dots + '</div><button class="quick" type="button" data-add="' + p.id + '">কার্টে দিন</button></div></div></article>';
  };
  KJ.bindCards = function (root) {
    KJ.$$("[data-add]", root).forEach(function (b) { b.onclick = function () { KJ.cart.add(b.dataset.add); }; });
    KJ.$$(".dot", root).forEach(function (d) {
      d.onclick = function () { var p = KJ.product(d.dataset.pid), ci = +d.dataset.ci; var img = KJ.$(".card-img img", d.closest(".card")); img.src = KJ.images(p, ci)[0]; KJ.$$(".dot", d.parentNode).forEach(function (x) { x.classList.toggle("on", x === d); }); };
    });
    KJ.reveal(root);
  };

  /* ---------- শুরু ---------- */
  buildChrome();
  KJ.renderCart();
  document.addEventListener("DOMContentLoaded", function () {});
})();
