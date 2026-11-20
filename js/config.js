/* ============================================================
   KJ Wear — সব সেটিংস এক জায়গায়
   এই ফাইলে শুধু নাম, নম্বর, চার্জ ও কী (key) বদলালেই হবে।
   ============================================================ */
window.KJ_CONFIG = {
  brand: {
    name: "KJ Wear",            // এখানে বদলালে সব পেজে বদলে যাবে
    mark: "KJ",
    tagline: "মেয়েদের থ্রি-পিস ও বোরকার প্রিমিয়াম কালেকশন"
  },

  // হিরো সেকশনের ফুল-উইডথ ছবি (১৯২০×১০৮০ বা বড়, ল্যান্ডস্কেপ)। ছবি images/ ফোল্ডারে রেখে নাম লিখুন।
  hero: { image: "", alt: "KJ Wear ফ্যাশন কালেকশন" },   // উদাহরণ: image: "images/hero.jpg"

  // ডিফল্ট ভাষা: "bn" বা "en" (ভিজিটর হেডারের বাটনে বদলাতে পারবে)
  lang: "bn",
  // আপনার নিজের লেখা বাংলা → English অনুবাদ এখানে যোগ করুন: { "বাংলা লেখা": "English text" }
  translations: {},

  // দেশের কোড সহ, + ছাড়া। উদাহরণ: 8801712345678
  whatsapp: "8801XXXXXXXXX",
  messenger: "",               // facebook পেজের username, যেমন "kjwear"
  email: "",
  currency: "৳",

  delivery: { insideDhaka: 70, outsideDhaka: 130, freeOver: 0 }, // freeOver: 0 = বন্ধ

  // নতুন ক্যাটাগরি (যেমন gents) যোগ করতে এখানে একটা লাইন যোগ করুন
  categories: [
    { id: "threepiece", name: "থ্রি-পিস", blurb: "প্রতিদিনের ও উৎসবের থ্রি-পিস" },
    { id: "borkha",     name: "বোরকা",    blurb: "মার্জিত ও আরামদায়ক বোরকা" }
  ],
  comingSoon: [{ id: "gents", name: "Gents" }],

  coupons: {
    KJ10: { type: "percent", value: 10 },
    WELCOME100: { type: "flat", value: 100 }
  },

  payments: {
    cod:   { enabled: true, label: "ক্যাশ অন ডেলিভারি", note: "পণ্য হাতে পেয়ে টাকা দিন" },
    bkash: {
      enabled: true, mode: "manual",          // "manual" বা "api"
      number: "01XXXXXXXXX", numberType: "Personal",
      api: { appKey: "", appSecret: "", username: "", password: "", sandbox: true }
    },
    nagad: {
      enabled: true, mode: "manual",
      number: "01XXXXXXXXX", numberType: "Personal",
      api: { merchantId: "", publicKey: "", privateKey: "", sandbox: true }
    },
    card: {
      enabled: true,
      provider: "sslcommerz",                 // "sslcommerz" বা "stripe"
      sslcommerz: { storeId: "", storePassword: "", sandbox: true },
      stripe: { publishableKey: "" }
    }
  },

  // ব্যাকএন্ড (Node/Express) যোগ করলে এখানে URL দিন, যেমন "https://api.kjwear.com"
  apiBase: "",

  // AI অ্যাসিস্ট্যান্ট: endpoint দিলে পূর্ণ AI উত্তর দেবে (POST {message, history} -> {reply})
  ai: { endpoint: "" }
};
