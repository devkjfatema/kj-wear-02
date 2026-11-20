/* KJ Wear — বাংলা / English ভাষা পরিবর্তন
   পেজের লেখা আপনা-আপনি অনুবাদ হয়। নতুন লেখা যোগ করলে config.js এর translations এ
   "বাংলা": "English" যোগ করুন। পণ্যের নাম/বর্ণনার জন্য products.js এ nameEn, descEn দিতে পারেন। */
(function () {
  var KJ = window.KJ, CFG = KJ.cfg;
  var EXACT = {
    "কার্ট": "Cart", "হোম": "Home", "শপ": "Shop", "সব": "All", "নতুন": "New", "চেকআউট": "Checkout", "পেমেন্ট": "Payment", "কেনাকাটা": "Shop", "যোগাযোগ": "Contact",
    "কালেকশন": "Collection", "থ্রি-পিস": "Three-piece", "বোরকা": "Borkha", "শীঘ্রই": "Soon", "সাইজ": "Size", "রঙ": "Colour", "পরিমাণ": "Quantity", "মুছুন": "Remove", "নাম": "Name", "ঠিকানা": "Address",
    "পাঠান": "Send", "প্রয়োগ": "Apply", "মোট": "Total", "ছাড়": "Discount", "ডেলিভারি": "Delivery", "ফ্রি": "Free", "মাপ": "Measurement", "দৈর্ঘ্য": "Length", "ছবি": "Image", "থ্রি-পিস দেখান": "Show three-piece"
  };
  var PH = {
    "আপনার প্রতিটি দিনের জন্য": "Clothing for every day,", "মার্জিত": "refined", "পোশাক": "and elegant",
    "নতুন কালেকশন": "New collection", "কালেকশন দেখুন": "View collection", "WhatsApp এ অর্ডার": "Order on WhatsApp",
    "বাছাই করা কাপড়, পরিপাটি সেলাই, সারা দেশে ডেলিভারি।": "Carefully chosen fabric, neat stitching, delivery all over the country.",
    "ক্যাশ অন ডেলিভারি": "Cash on delivery", "সারা বাংলাদেশে ডেলিভারি": "Delivery across Bangladesh", "হিরো ছবি:": "Hero image:",
    "মেয়েদের থ্রি-পিস ও বোরকার প্রিমিয়াম কালেকশন": "Premium three-piece and borkha collection for women",
    "আপনার পছন্দের ধরন বেছে নিন": "Choose your style", "প্রতিদিনের ও উৎসবের থ্রি-পিস": "Three-piece for everyday and festive wear", "মার্জিত ও আরামদায়ক বোরকা": "Elegant and comfortable borkha", "দেখুন →": "View →",
    "বাছাই করা": "Handpicked", "ফিচার্ড পণ্য": "Featured products", "সব পণ্য →": "All products →", "সব পণ্য": "All products",
    "ভরসার কারণ": "Why choose us", "কেন": "Why", "বাছাই করা কাপড়": "Selected fabric", "আরামদায়ক ও টেকসই কাপড়, প্রতিটি পণ্য পাঠানোর আগে দেখা হয়।": "Comfortable, durable fabric. Every item is checked before dispatch.",
    "নিখুঁত সেলাই": "Neat stitching", "পরিপাটি ফিনিশিং ও ঠিক মাপ, যাতে পরলে আরাম পান।": "Clean finishing and accurate sizing for a comfortable fit.",
    "সহজ পেমেন্ট": "Easy payment", "ক্যাশ অন ডেলিভারি, bKash, Nagad ও কার্ড।": "Cash on delivery, bKash, Nagad and cards.",
    "দ্রুত সাড়া": "Quick response", "যেকোনো প্রশ্নে WhatsApp এ সরাসরি কথা বলুন।": "Talk to us directly on WhatsApp for any question.",
    "অর্ডার করবেন যেভাবে": "How to order", "চারটি সহজ ধাপ": "Four easy steps", "পণ্য বেছে নিন": "Pick your product", "সাইজ ও রঙ ঠিক করে কার্টে দিন": "Choose size and colour, add to cart", "নাম, ঠিকানা ও পেমেন্ট দিন": "Enter name, address and payment", "ঘরে বসে পণ্য বুঝে নিন": "Receive it at home",
    "শীঘ্রই আসছে": "Coming soon", "কালেকশন": "collection", "ছেলেদের পোশাক আসছে। আগে জানতে চাইলে WhatsApp এ জানিয়ে রাখুন।": "Menswear is on the way. Tell us on WhatsApp to be notified first.", "আমাকে জানান": "Notify me",
    "সব পণ্য দেখুন": "View all products", "সাজান": "Sort", "নতুন আগে": "Newest first", "দাম কম থেকে বেশি": "Price: low to high", "দাম বেশি থেকে কম": "Price: high to low", "এর ফলাফল": "results", "কোনো পণ্য পাওয়া যায়নি।": "No products found.", "পণ্যটি পাওয়া যায়নি।": "Product not found.",
    "টি পণ্য": " products", "কার্টে দিন": "Add to cart", "কার্টে যোগ করুন": "Add to cart", "এখনই কিনুন": "Buy now", "সাইজ গাইড": "Size guide", "আরও দেখুন": "You may also like", "হোম": "Home", "রঙ:": "Colour:",
    "ছবি ": "Image ", "পাশের দিক": "Side view", "ডিটেইল": "Detail", "ছবি যোগ করুন": "Add photo", "কমান": "Decrease", "বাড়ান": "Increase", "কার্টে যোগ হয়েছে": "added to cart", "· সাইজ": "· Size",
    "WhatsApp এ সাহায্য": "Help on WhatsApp", "bKash / Nagad": "bKash / Nagad", "এখানে পণ্যের ছোট বর্ণনা লিখুন: কাপড়ের ধরন, কাট ও যত্নের নিয়ম।": "Add a short product description: fabric, cut and care instructions.",
    "নিজের মাপের সঙ্গে মিলিয়ে নিন। মাপ নিয়ে সন্দেহ থাকলে WhatsApp এ জানান।": "Compare with your own measurements. Unsure? Message us on WhatsApp.", "ইঞ্চি": "inch", "বুক": "Chest",
    "আপনার কার্ট এখন খালি।": "Your cart is empty.", "কার্ট খালি। আগে পণ্য যোগ করুন।": "Your cart is empty. Add a product first.", "কেনাকাটা শুরু করুন": "Start shopping", "আপনার কার্ট": "Your cart", "সারসংক্ষেপ": "Summary", "আরও কিনুন": "Continue shopping",
    "সাবটোটাল": "Subtotal", "ডেলিভারি চার্জ চেকআউটে যোগ হবে।": "Delivery charge is added at checkout.", "চেকআউট করুন": "Checkout", "পুরো কার্ট দেখুন": "View full cart", "বন্ধ করুন": "Close",
    "অর্ডার সম্পন্ন করুন": "Complete your order", "ডেলিভারির তথ্য": "Delivery details", "মোবাইল নম্বর": "Mobile number", "ডেলিভারি এলাকা": "Delivery area", "ঢাকার ভেতরে": "Inside Dhaka", "ঢাকার বাইরে": "Outside Dhaka", "পূর্ণ ঠিকানা": "Full address", "বাসা/রাস্তা, থানা, জেলা": "House/road, thana, district", "নোট (ঐচ্ছিক)": "Note (optional)",
    "পেমেন্ট পদ্ধতি": "Payment method", "ক্যাশ অন ডেলিভারি": "Cash on delivery", "পণ্য হাতে পেয়ে টাকা দিন": "Pay when you receive the product", "কার্ড (Visa / Mastercard)": "Card (Visa / Mastercard)",
    "অর্ডার সামারি": "Order summary", "কুপন কোড": "Coupon code", "কুপন প্রয়োগ হয়েছে।": "Coupon applied.", "কুপনটি সঠিক নয়।": "Invalid coupon.", "কিছু পণ্যের দাম এখনো দেওয়া হয়নি, তাই মোট কম দেখাচ্ছে।": "Some prices are not set yet, so the total looks lower.", "অর্ডার করুন": "Place order", "অর্ডার হচ্ছে…": "Placing order…",
    "নিচের": "Send money to this", "নম্বরে টাকা পাঠান:": "number:", "\"Send Money\" করে টাকা পাঠান, তারপর নিচে আপনার নম্বর ও TrxID দিন।": "Use \"Send Money\", then enter your number and TrxID below.", "যে নম্বর থেকে পাঠিয়েছেন": "Number you sent from", "যেমন": "e.g.",
    "চাপলে": "", "পেমেন্ট পেজে যাবেন।": "payment page.", "কার্ড পেমেন্ট শীঘ্রই চালু হবে। এখন ক্যাশ অন ডেলিভারি, bKash বা Nagad ব্যবহার করুন।": "Card payment is coming soon. Please use cash on delivery, bKash or Nagad for now.",
    "আপনার নাম লিখুন": "Enter your name", "সঠিক মোবাইল নম্বর দিন (১১ ডিজিট)": "Enter a valid mobile number (11 digits)", "পূর্ণ ঠিকানা লিখুন": "Enter your full address", "একটি পেমেন্ট পদ্ধতি বেছে নিন": "Choose a payment method", "সঠিক TrxID দিন": "Enter a valid TrxID", "কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন": "Something went wrong, please try again",
    "ধন্যবাদ,": "Thank you,", "আপনার অর্ডার পাওয়া গেছে": "We received your order", "অর্ডার নম্বর": "Order number", "আমরা আপনার TrxID মিলিয়ে দেখে অর্ডার নিশ্চিত করব।": "We will verify your TrxID and confirm the order.", "খুব শীঘ্রই ফোনে যোগাযোগ করা হবে।": "We will call you very soon.", "WhatsApp এ অর্ডার সামারি পাঠান": "Send order summary on WhatsApp", "আরও কেনাকাটা": "Continue shopping", "কোনো অর্ডার পাওয়া যায়নি।": "No order found.", "কেনাকাটা করুন": "Shop now",
    "মেনু": "Menu", "প্রধান মেনু": "Main menu", "পণ্য খুঁজুন…": "Search products…", "পণ্য খুঁজুন": "Search products", "ভয়েস দিয়ে খুঁজুন": "Search by voice", "খুঁজুন": "Search", "কার্ট খুলুন": "Open cart", "WhatsApp এ মেসেজ করুন": "Message on WhatsApp", "সর্বস্বত্ব সংরক্ষিত।": "All rights reserved.", "ভয়েস ধরতে পারিনি, টাইপ করুন": "Could not hear you, please type",
    "পণ্য": "Product", "অ্যাসিস্ট্যান্ট": "Assistant", "পণ্য, সাইজ, ডেলিভারি, পেমেন্ট": "Products, size, delivery, payment", "ডেলিভারি চার্জ কত?": "Delivery charge?", "পেমেন্ট কিভাবে?": "How to pay?", "এখানে লিখুন বা বলুন…": "Type or speak here…", "মেসেজ লিখুন": "Type a message", "বলুন": "Speak", "AI অ্যাসিস্ট্যান্ট": "AI assistant",
    "আসসালামু আলাইকুম! আমি আপনাকে পণ্য খুঁজতে, সাইজ বা ডেলিভারি জানতে আর কার্টে যোগ করতে সাহায্য করতে পারি। লিখুন অথবা মাইক চেপে বলুন।": "Hello! I can help you find products, check sizes and delivery, and add items to your cart. Type or tap the mic and speak.",
    "পণ্যের দাম প্রতিটি পণ্যের পাতায় দেওয়া আছে। কোন পণ্যের দাম জানতে চান, নাম বা ডিজাইন নম্বর বলুন।": "Prices are on each product page. Tell me the product name or design number.",
    "থ্রি-পিসের সাইজ M, L, XL, XXL। বোরকার সাইজ ৫২, ৫৪, ৫৬, ৫৮ (দৈর্ঘ্য ইঞ্চিতে)। প্রতিটি পণ্যের পাতায় সাইজ গাইড আছে। নিশ্চিত না হলে WhatsApp এ মাপ জানান।": "Three-piece sizes: M, L, XL, XXL. Borkha sizes: 52, 54, 56, 58 (length in inches). Each product page has a size guide. If unsure, send your measurements on WhatsApp.",
    "ঢাকার ভেতরে ডেলিভারি চার্জ": "Delivery inside Dhaka:", ", ঢাকার বাইরে": ", outside Dhaka:", "এর বেশি কিনলে ডেলিভারি ফ্রি।": "or more gets free delivery.",
    "আমরা ক্যাশ অন ডেলিভারি, bKash, Nagad এবং (চালু হলে) Visa/Mastercard কার্ড নিই। bKash/Nagad এ টাকা পাঠিয়ে চেকআউটে TrxID দিতে হয়।": "We accept cash on delivery, bKash, Nagad and (when enabled) Visa/Mastercard. For bKash/Nagad, send the money and enter the TrxID at checkout.",
    "রিটার্ন ও এক্সচেঞ্জের নিয়ম জানতে WhatsApp এ যোগাযোগ করুন।": "Message us on WhatsApp for return and exchange details.", "Gents কালেকশন শীঘ্রই আসছে। প্রথমে মেয়েদের থ্রি-পিস ও বোরকা পাওয়া যাচ্ছে।": "The Gents collection is coming soon. Women's three-piece and borkha are available now.",
    "কালেকশনে": "collection has", "টি ডিজাইন আছে। কয়েকটা দেখুন:": " designs. Take a look:", "সব দেখুন": "View all", "ওয়ালাইকুম আসসালাম! আমি": "Wa alaikum assalam! I am the", "এর অ্যাসিস্ট্যান্ট। পণ্য, দাম, সাইজ, ডেলিভারি বা পেমেন্ট নিয়ে জিজ্ঞেস করুন।": "assistant. Ask about products, prices, sizes, delivery or payment.",
    "দুঃখিত, এটা পুরোপুরি বুঝতে পারিনি। পণ্য, সাইজ, ডেলিভারি বা পেমেন্ট নিয়ে জিজ্ঞেস করতে পারেন, অথবা সরাসরি WhatsApp এ কথা বলুন।": "Sorry, I did not fully understand. Ask about products, size, delivery or payment, or talk to us on WhatsApp.", "WhatsApp এ কথা বলুন": "Chat on WhatsApp", "কার্ট দেখুন": "View cart", "\" কার্টে যোগ করেছি। সাইজ ও রঙ বদলাতে কার্ট দেখুন।": "\" added to your cart. Open the cart to change size or colour.", "কার্টে যোগ করেছি।": "added to your cart.",
    "মালবেরি": "Mulberry", "অলিভ": "Olive", "নেভি": "Navy", "রোজ": "Rose", "স্যান্ড": "Sand", "কালো": "Black", "টিল": "Teal", "প্লাম": "Plum",
    "[দাম]": "[Price]", "দাম": "Price", "থ্রি-পিস ডিজাইন": "Three-piece Design", "বোরকা ডিজাইন": "Borkha Design", "পেমেন্ট": "Payment", "KJ Wear ফ্যাশন কালেকশন": "KJ Wear fashion collection"
  };
  var custom = Object.assign({}, CFG.translations || {});
  (window.KJ_PRODUCTS || []).forEach(function (p) { if (p.nameEn) custom[p.name] = p.nameEn; if (p.descEn && p.desc) custom[p.desc] = p.descEn; });
  var keys, cache = {}, lang = KJ.store("kj_lang") || CFG.lang || "bn";
  function build() { keys = Object.keys(PH).concat(Object.keys(custom)).sort(function (a, b) { return b.length - a.length; }); cache = {}; }
  build();
  var BN = "০১২৩৪৫৬৭৮৯";
  function tr(s) {
    if (cache[s] !== undefined) return cache[s];
    var t = s.trim(), lead = s.slice(0, s.indexOf(t)), trail = s.slice(s.indexOf(t) + t.length), out;
    if (!t) return (cache[s] = s);
    if (custom[t] !== undefined) out = custom[t];
    else if (EXACT[t] !== undefined) out = EXACT[t];
    else {
      out = t;
      for (var i = 0; i < keys.length; i++) { var k = keys[i]; if (out.indexOf(k) > -1) out = out.split(k).join(custom[k] !== undefined ? custom[k] : PH[k]); }
    }
    out = out.replace(/[০-৯]/g, function (d) { return BN.indexOf(d); }).replace(/।/g, ".").replace(/\s{2,}/g, " ");
    return (cache[s] = lead + out + trail);
  }
  var ATTRS = ["placeholder", "aria-label", "title", "alt"], obs;
  function textNodes(root) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { var p = n.parentNode && n.parentNode.nodeName; return p === "SCRIPT" || p === "STYLE" || p === "TEXTAREA" || p === "PRE" ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } }), a = [], n;
    while ((n = w.nextNode())) a.push(n);
    return a;
  }
  function apply(root) {
    if (obs) obs.disconnect();
    textNodes(root).forEach(function (n) {
      if (n.__o === undefined) n.__o = n.nodeValue;
      else if (n.__t !== undefined && n.nodeValue !== n.__t) n.__o = n.nodeValue;
      var v = lang === "en" ? tr(n.__o) : n.__o;
      if (n.nodeValue !== v) n.nodeValue = v; n.__t = v;
    });
    var els = root.querySelectorAll ? root.querySelectorAll("[placeholder],[aria-label],[title],[alt]") : [];
    Array.prototype.forEach.call(els, function (el) {
      ATTRS.forEach(function (a) {
        if (!el.hasAttribute(a)) return;
        var k = "_o_" + a; if (el[k] === undefined || (el["_t_" + a] !== undefined && el.getAttribute(a) !== el["_t_" + a])) el[k] = el.getAttribute(a);
        var v = lang === "en" ? tr(el[k]) : el[k]; if (el.getAttribute(a) !== v) el.setAttribute(a, v); el["_t_" + a] = v;
      });
    });
    if (obs) obs.observe(document.body, { childList: true, subtree: true });
  }
  function setLang(l) {
    lang = l; KJ.lang = l; KJ.store("kj_lang", l); document.documentElement.lang = l;
    var b = KJ.$("#langBtn"); if (b) { b.textContent = l === "en" ? "বাংলা" : "EN"; b.setAttribute("aria-label", l === "en" ? "বাংলায় দেখুন" : "View in English"); b.title = b.getAttribute("aria-label"); }
    apply(document.body);
    if (lang === "en") document.title = tr(document.title);
  }
  KJ.lang = lang;
  KJ.t = function (bn) { return lang === "en" ? tr(bn) : bn; };

  var btn = document.createElement("button"); btn.id = "langBtn"; btn.className = "lang-btn"; btn.type = "button";
  var cartBtn = KJ.$("#cartBtn"); cartBtn.parentNode.insertBefore(btn, cartBtn);
  btn.onclick = function () { setLang(lang === "en" ? "bn" : "en"); };

  var pending = false;
  obs = new MutationObserver(function () { if (pending) return; pending = true; requestAnimationFrame(function () { pending = false; apply(document.body); }); });
  setLang(lang); obs.observe(document.body, { childList: true, subtree: true });
})();
