/* ============================================================
   KJ Wear — পণ্যের তালিকা
   নতুন পণ্য যোগ করতে নিচের লাইনগুলোর যেকোনো একটা কপি করে বদলান।
   ছবি না দিলে আপনা-আপনি প্লেসহোল্ডার ছবি দেখাবে।

   পূর্ণ উদাহরণ (সব অপশন):
   {
     id: "tp-13",                      // প্রতিটির আলাদা id
     category: "threepiece",           // config.js এর categories থেকে
     name: "রোজ গার্ডেন থ্রি-পিস",
     price: 2450,                      // null দিলে "[দাম]" দেখাবে
     oldPrice: 2900,                   // ঐচ্ছিক, কাটা দাম
     badge: "নতুন",                    // ঐচ্ছিক
     isNew: true, featured: true,
     desc: "ছোট বর্ণনা",
     sizes: ["M","L","XL"],
     colors: [
       { name: "মালবেরি", hex: "#6B1F45", images: ["images/rose-1.jpg","images/rose-2.jpg"] },
       { name: "নেভি",    hex: "#1F2A44", images: [] }
     ]
   }
   ============================================================ */
(function () {
  var C = {
    mulberry: { name: "মালবেরি", hex: "#6B1F45" },
    olive:    { name: "অলিভ",    hex: "#5C6140" },
    navy:     { name: "নেভি",    hex: "#1F2A44" },
    rose:     { name: "রোজ",     hex: "#B4647F" },
    sand:     { name: "স্যান্ড", hex: "#C8AE8A" },
    black:    { name: "কালো",    hex: "#1E1A1C" },
    teal:     { name: "টিল",     hex: "#2F5D5A" },
    plum:     { name: "প্লাম",   hex: "#4A2441" }
  };
  function cl(keys) { return keys.map(function (k) { return { name: C[k].name, hex: C[k].hex, images: [] }; }); }

  // P(id, ক্যাটাগরি, নাম, রঙ-তালিকা, সাইজ, দাম, বিশেষ)
  var TP = ["M", "L", "XL", "XXL"], BK = ["52", "54", "56", "58"];
  function P(id, category, name, colors, sizes, price, extra) {
    var o = { id: id, category: category, name: name, price: price, sizes: sizes, colors: cl(colors),
              desc: "এখানে পণ্যের ছোট বর্ণনা লিখুন: কাপড়ের ধরন, কাট ও যত্নের নিয়ম।" };
    for (var k in (extra || {})) o[k] = extra[k];
    return o;
  }

  window.KJ_PRODUCTS = [
    P("tp-01", "threepiece", "থ্রি-পিস ডিজাইন ০১", ["mulberry", "navy", "sand"], TP, null, { featured: true, isNew: true, badge: "নতুন" }),
    P("tp-02", "threepiece", "থ্রি-পিস ডিজাইন ০২", ["rose", "olive"], TP, null, { featured: true }),
    P("tp-03", "threepiece", "থ্রি-পিস ডিজাইন ০৩", ["teal", "plum", "sand"], TP, null, { featured: true }),
    P("tp-04", "threepiece", "থ্রি-পিস ডিজাইন ০৪", ["navy", "rose"], TP, null, { isNew: true }),
    P("tp-05", "threepiece", "থ্রি-পিস ডিজাইন ০৫", ["olive", "sand"], TP, null),
    P("tp-06", "threepiece", "থ্রি-পিস ডিজাইন ০৬", ["mulberry", "teal"], TP, null),
    P("tp-07", "threepiece", "থ্রি-পিস ডিজাইন ০৭", ["plum", "rose", "navy"], TP, null),
    P("tp-08", "threepiece", "থ্রি-পিস ডিজাইন ০৮", ["sand", "olive"], TP, null),
    P("tp-09", "threepiece", "থ্রি-পিস ডিজাইন ০৯", ["teal", "rose"], TP, null),
    P("tp-10", "threepiece", "থ্রি-পিস ডিজাইন ১০", ["mulberry", "sand"], TP, null),
    P("tp-11", "threepiece", "থ্রি-পিস ডিজাইন ১১", ["navy", "plum"], TP, null),
    P("tp-12", "threepiece", "থ্রি-পিস ডিজাইন ১২", ["olive", "teal", "rose"], TP, null),

    P("bk-01", "borkha", "বোরকা ডিজাইন ০১", ["black", "navy"], BK, null, { featured: true, isNew: true, badge: "নতুন" }),
    P("bk-02", "borkha", "বোরকা ডিজাইন ০২", ["black", "plum"], BK, null, { featured: true }),
    P("bk-03", "borkha", "বোরকা ডিজাইন ০৩", ["navy", "olive"], BK, null, { featured: true }),
    P("bk-04", "borkha", "বোরকা ডিজাইন ০৪", ["black", "teal"], BK, null, { isNew: true }),
    P("bk-05", "borkha", "বোরকা ডিজাইন ০৫", ["plum", "black"], BK, null),
    P("bk-06", "borkha", "বোরকা ডিজাইন ০৬", ["olive", "black"], BK, null),
    P("bk-07", "borkha", "বোরকা ডিজাইন ০৭", ["navy", "sand"], BK, null),
    P("bk-08", "borkha", "বোরকা ডিজাইন ০৮", ["black", "mulberry"], BK, null),
    P("bk-09", "borkha", "বোরকা ডিজাইন ০৯", ["teal", "black"], BK, null),
    P("bk-10", "borkha", "বোরকা ডিজাইন ১০", ["sand", "navy"], BK, null),
    P("bk-11", "borkha", "বোরকা ডিজাইন ১১", ["plum", "navy"], BK, null),
    P("bk-12", "borkha", "বোরকা ডিজাইন ১২", ["black", "olive"], BK, null)
  ];
})();
