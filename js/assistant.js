/* KJ Wear — AI শপিং অ্যাসিস্ট্যান্ট + ভয়েস
   endpoint না থাকলে অফলাইন নিয়ম-ভিত্তিক উত্তর দেয়। config.js এ ai.endpoint দিলে পূর্ণ AI চালু হবে। */
(function () {
  var KJ = window.KJ, CFG = KJ.cfg;
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  /* ---------- ভয়েস ---------- */
  KJ.listen = function (onText, onState) {
    if (!SR) return;
    var r = new SR(); r.lang = KJ.lang === "en" ? "en-US" : "bn-BD";
    r.interimResults = false; r.maxAlternatives = 1;
    r.onstart = function () { onState(true); }; r.onend = function () { onState(false); };
    r.onerror = function () { onState(false); KJ.toast("ভয়েস ধরতে পারিনি, টাইপ করুন"); };
    r.onresult = function (e) { onText(e.results[0][0].transcript); };
    try { r.start(); } catch (e) { onState(false); }
  };
  if (SR) {
    var mic = KJ.$("#micSearch"); mic.hidden = false;
    mic.onclick = function () { KJ.listen(function (t) { KJ.$("#q").value = t; KJ.$("#searchForm").dispatchEvent(new Event("submit", { cancelable: true })); }, function (on) { mic.classList.toggle("rec", on); }); };
  }

  /* ---------- নিয়ম-ভিত্তিক উত্তর ---------- */
  var D = CFG.delivery, P = CFG.payments;
  function has(t, words) { return words.some(function (w) { return t.indexOf(w) > -1; }); }
  function search(t) {
    var cat = has(t, ["বোরকা", "borkha", "burqa", "burka"]) ? "borkha" : has(t, ["থ্রি", "three", "3pc", "সালোয়ার"]) ? "threepiece" : null;
    var list = window.KJ_PRODUCTS.filter(function (p) { return (!cat || p.category === cat) && (cat || t.split(/\s+/).some(function (w) { return w.length > 2 && p.name.toLowerCase().indexOf(w) > -1; })); });
    return { cat: cat, list: list };
  }
  KJ.assistReply = function (text) {
    var t = text.toLowerCase().trim();
    if (has(t, ["কার্টে", "add to cart", "add"]) && (has(t, ["বোরকা", "থ্রি", "borkha", "three", "design", "ডিজাইন"]) || /\d/.test(t))) {
      var r = search(t), num = (t.replace(/[০-৯]/g, function (d) { return "০১২৩৪৫৬৭৮৯".indexOf(d); }).match(/\d+/) || [])[0];
      var pick = r.list.filter(function (p) { return num && p.name.replace(/[০-৯]/g, function (d) { return "০১২৩৪৫৬৭৮৯".indexOf(d); }).indexOf(String(+num).padStart(2, "0")) > -1; })[0] || r.list[0];
      if (pick) { KJ.cart.add(pick.id, null, null, 1, false); return { text: "\"" + pick.name + "\" কার্টে যোগ করেছি। সাইজ ও রঙ বদলাতে কার্ট দেখুন।", links: [{ t: "কার্ট দেখুন", h: "cart.html" }] }; }
    }
    if (has(t, ["দাম", "price", "কত", "টাকা"]) && !has(t, ["ডেলিভারি", "delivery"])) return { text: "পণ্যের দাম প্রতিটি পণ্যের পাতায় দেওয়া আছে। কোন পণ্যের দাম জানতে চান, নাম বা ডিজাইন নম্বর বলুন।", links: [{ t: "সব পণ্য", h: "shop.html" }] };
    if (has(t, ["সাইজ", "size", "মাপ", "মেজার"])) return { text: "থ্রি-পিসের সাইজ M, L, XL, XXL। বোরকার সাইজ ৫২, ৫৪, ৫৬, ৫৮ (দৈর্ঘ্য ইঞ্চিতে)। প্রতিটি পণ্যের পাতায় সাইজ গাইড আছে। নিশ্চিত না হলে WhatsApp এ মাপ জানান।" };
    if (has(t, ["ডেলিভারি", "delivery", "চার্জ", "shipping", "কতদিন"])) return { text: "ঢাকার ভেতরে ডেলিভারি চার্জ " + KJ.money(D.insideDhaka) + ", ঢাকার বাইরে " + KJ.money(D.outsideDhaka) + "।" + (D.freeOver ? " " + KJ.money(D.freeOver) + " এর বেশি কিনলে ডেলিভারি ফ্রি।" : "") };
    if (has(t, ["পেমেন্ট", "payment", "বিকাশ", "bkash", "নগদ", "nagad", "cod", "ক্যাশ", "কার্ড", "card"])) return { text: "আমরা ক্যাশ অন ডেলিভারি, bKash, Nagad এবং (চালু হলে) Visa/Mastercard কার্ড নিই। bKash/Nagad এ টাকা পাঠিয়ে চেকআউটে TrxID দিতে হয়।", links: [{ t: "চেকআউট", h: "checkout.html" }] };
    if (has(t, ["রিটার্ন", "return", "ফেরত", "exchange", "বদল"])) return { text: "রিটার্ন ও এক্সচেঞ্জের নিয়ম জানতে WhatsApp এ যোগাযোগ করুন।", links: [{ t: "WhatsApp", h: KJ.waLink("রিটার্ন সম্পর্কে জানতে চাই"), ext: true }] };
    if (has(t, ["gents", "ছেলে", "পুরুষ", "পাঞ্জাবি"])) return { text: "Gents কালেকশন শীঘ্রই আসছে। প্রথমে মেয়েদের থ্রি-পিস ও বোরকা পাওয়া যাচ্ছে।" };
    var s = search(t);
    if (s.cat || s.list.length) { var top = s.list.slice(0, 3); return { text: (s.cat ? KJ.catName(s.cat) : "পণ্য") + " কালেকশনে " + KJ.bn(s.list.length) + "টি ডিজাইন আছে। কয়েকটা দেখুন:", links: top.map(function (p) { return { t: p.name, h: "product.html?id=" + p.id }; }).concat([{ t: "সব দেখুন", h: "shop.html" + (s.cat ? "?cat=" + s.cat : "") }]) }; }
    if (has(t, ["হ্যালো", "hello", "hi", "সালাম", "আসসালামু"])) return { text: "ওয়ালাইকুম আসসালাম! আমি " + CFG.brand.name + " এর অ্যাসিস্ট্যান্ট। পণ্য, দাম, সাইজ, ডেলিভারি বা পেমেন্ট নিয়ে জিজ্ঞেস করুন।" };
    return { text: "দুঃখিত, এটা পুরোপুরি বুঝতে পারিনি। পণ্য, সাইজ, ডেলিভারি বা পেমেন্ট নিয়ে জিজ্ঞেস করতে পারেন, অথবা সরাসরি WhatsApp এ কথা বলুন।", links: [{ t: "WhatsApp এ কথা বলুন", h: KJ.waLink(text), ext: true }] };
  };

  /* ---------- চ্যাট উইজেট ---------- */
  var hist = [];
  var box = document.createElement("section");
  box.className = "assist"; box.id = "assist"; box.setAttribute("aria-label", "AI অ্যাসিস্ট্যান্ট"); box.hidden = true;
  box.innerHTML = '<div class="assist-head"><div><strong>' + KJ.esc(CFG.brand.name) + ' অ্যাসিস্ট্যান্ট</strong><small>পণ্য, সাইজ, ডেলিভারি, পেমেন্ট</small></div><button class="icon-btn" id="assistClose" aria-label="বন্ধ করুন">✕</button></div>' +
    '<div class="assist-log" id="assistLog" aria-live="polite"></div>' +
    '<div class="assist-chips"><button type="button">থ্রি-পিস দেখান</button><button type="button">ডেলিভারি চার্জ কত?</button><button type="button">পেমেন্ট কিভাবে?</button></div>' +
    '<form class="assist-form" id="assistForm"><label class="sr" for="assistInput">মেসেজ লিখুন</label><input id="assistInput" placeholder="এখানে লিখুন বা বলুন…" autocomplete="off"><button type="button" class="icon-btn" id="assistMic" aria-label="বলুন" hidden>' + KJ.icon.mic + '</button><button class="send" aria-label="পাঠান">পাঠান</button></form>';
  document.body.appendChild(box);
  var log = KJ.$("#assistLog");
  function add(who, html) { var d = document.createElement("div"); d.className = "msg " + who; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  function render(res) {
    var h = KJ.esc(res.text).replace(/\n/g, "<br>");
    if (res.links) h += '<div class="msg-links">' + res.links.map(function (l) { return '<a href="' + KJ.esc(l.h) + '"' + (l.ext ? ' target="_blank" rel="noopener"' : "") + '>' + KJ.esc(l.t) + '</a>'; }).join("") + '</div>';
    add("bot", h);
  }
  function ask(text) {
    if (!text.trim()) return;
    add("me", KJ.esc(text)); hist.push({ role: "user", content: text });
    if (CFG.ai.endpoint) {
      var wait = add("bot", "…");
      fetch(CFG.ai.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, history: hist }) })
        .then(function (r) { return r.json(); }).then(function (j) { wait.remove(); render({ text: j.reply }); hist.push({ role: "assistant", content: j.reply }); })
        .catch(function () { wait.remove(); render(KJ.assistReply(text)); });
    } else { var r = KJ.assistReply(text); setTimeout(function () { render(r); }, 250); }
  }
  render({ text: "আসসালামু আলাইকুম! আমি আপনাকে পণ্য খুঁজতে, সাইজ বা ডেলিভারি জানতে আর কার্টে যোগ করতে সাহায্য করতে পারি। লিখুন অথবা মাইক চেপে বলুন।" });
  KJ.$("#assistForm").onsubmit = function (e) { e.preventDefault(); var i = KJ.$("#assistInput"); var v = i.value; i.value = ""; ask(v); };
  KJ.$$(".assist-chips button").forEach(function (b) { b.onclick = function () { ask(b.textContent); }; });
  if (SR) { var m = KJ.$("#assistMic"); m.hidden = false; m.onclick = function () { KJ.listen(function (t) { ask(t); }, function (on) { m.classList.toggle("rec", on); }); }; }
  KJ.$("#aiBtn").onclick = function () { box.hidden = !box.hidden; if (!box.hidden) KJ.$("#assistInput").focus(); };
  KJ.$("#assistClose").onclick = function () { box.hidden = true; };
})();
