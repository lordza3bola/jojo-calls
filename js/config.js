/* Everything you might want to tune lives here. */
window.CONFIG = {
  points: { complete: 100, fast: 50, thoughtful: 25, perfect: 100 },
  heartsMax: 10,
  idleCallSeconds: 25,          // menu idle time before Jojo calls on her own

  // Jojo's real favorites
  foods: [
    { key: 'macarona', en: 'Macarona bechamel', ar: 'مكرونة بشاميل' },
    { key: 'mahshy', en: 'Mahshy wara2 3enab', ar: 'محشي ورق عنب بدبس الرمان' },
    { key: 'frappe', en: 'Mocha frappe', ar: 'موكا فرابيه' },
    { key: 'tea', en: 'Shay bel laban', ar: 'شاي بلبن' }
  ],
  shows: [
    { en: 'Stranger Things', ar: 'سترينجر ثينجز', fav: true },
    { en: 'Ashghal Shaqa', ar: 'أشغال شقة', fav: true },
    { en: 'Ashghal Shaqa Gedan', ar: 'أشغال شقة جداً', fav: true },
    { en: 'Balto', ar: 'بالطو', fav: true },
    { en: 'El Le3ba', ar: 'اللعبة', fav: true },
    { en: 'Kamel El Adad', ar: 'كامل العدد', fav: true },
    { en: 'Abo El Arousa', ar: 'أبو العروسة', fav: true },
    { en: 'Football match', ar: 'ماتش كورة', fav: false },
    { en: 'The news', ar: 'نشرة الأخبار', fav: false }
  ],
  places: [
    { key: 'cafe', item: 'frappe', en: 'Café', ar: 'كافيه', fav: true },
    { key: 'restaurant', item: 'macarona', en: 'Restaurant', ar: 'مطعم', fav: false },
    { key: 'park', item: 'tree', en: 'Park', ar: 'جنينة', fav: false },
    { key: 'travel', item: 'plane', en: 'Travel abroad', ar: 'سفر برة', fav: true }
  ],
  gifts: [
    { key: 'roses', en: 'Roses', ar: 'ورد', price: 150 },
    { key: 'gold', en: 'Gold bracelet', ar: 'انسيال دهب', price: 400 },
    { key: 'chocolate', en: 'Chocolate', ar: 'شوكولاتة', price: 100 },
    { key: 'teddy', en: 'Teddy bear', ar: 'دبدوب', price: 120 }
  ],
  giftHints: {
    roses: { en: 'Roses make my whole day...', ar: 'الورد بيفرحني أوي' },
    gold: { en: 'I saw the cutest gold bracelet today...', ar: 'شفت انسيال دهب تحفة' }
  },
  coinValue: 25,
  startBudget: 100,

  // per mission, per level (1-3)
  hungry: { time: [45, 40, 35], need: 3, speed: [240, 290, 340], obstacleGap: [1.9, 1.5, 1.2] },
  sick: { time: [30, 25, 20], decoys: [4, 6, 8] },
  out: { prepTime: [14, 11, 9], mash: [8, 10, 12] },
  present: { coinTime: [20, 18, 16] },
  attention: { mash: [14, 18, 22], mashTime: [6, 6, 5.5] },
  joke: { zone: [0.26, 0.2, 0.15], speed: [1.1, 1.4, 1.7] },
  movie: { time: [15, 12, 10] }
};
