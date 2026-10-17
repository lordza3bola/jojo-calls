/* Drawn art for the test version: item stickers and room backgrounds.
   Every item gets the same white sticker border as the Concept D stickers.
   Replace any of these later by dropping a PNG into assets/ and pointing
   manifest.json at it. */
(function () {
  const INK = '#2a1a1a';
  const STK = '<defs><filter id="s" x="-25%" y="-25%" width="150%" height="150%">' +
    '<feMorphology in="SourceAlpha" operator="dilate" radius="6" result="d"/>' +
    '<feGaussianBlur in="d" stdDeviation="2.5" result="b"/><feOffset in="b" dy="3" result="o"/>' +
    '<feFlood flood-color="#3a2a1a" flood-opacity=".28"/><feComposite in2="o" operator="in" result="sh"/>' +
    '<feFlood flood-color="#ffffff"/><feComposite in2="d" operator="in" result="w"/>' +
    '<feMerge><feMergeNode in="sh"/><feMergeNode in="w"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
  const icon = (inner) => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">' + STK +
    '<g filter="url(#s)" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">' + inner + '</g></svg>';
  const heart = (x, y, s, f) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0,6 C-9,-3 -15,-9 -9,-15 C-4,-19 0,-15 0,-11 C0,-15 4,-19 9,-15 C15,-9 9,-3 0,6Z" fill="${f || '#E2456B'}"/>`;

  const ITEMS = {
    macarona: icon('<rect x="6" y="58" width="14" height="14" rx="4" fill="#ECE6DA"/><rect x="100" y="58" width="14" height="14" rx="4" fill="#ECE6DA"/>' +
      '<rect x="14" y="44" width="92" height="52" rx="10" fill="#ECE6DA"/><rect x="21" y="49" width="78" height="36" rx="6" fill="#F2C14E"/>' +
      '<g stroke="none" fill="#C77B26"><ellipse cx="36" cy="60" rx="7" ry="4"/><ellipse cx="62" cy="70" rx="9" ry="5"/><ellipse cx="84" cy="58" rx="6" ry="4"/><ellipse cx="44" cy="76" rx="5" ry="3"/><ellipse cx="80" cy="76" rx="6" ry="3"/></g>' +
      '<path d="M48,49 L48,85 M72,49 L72,85" stroke="#B5701F" stroke-width="2"/>'),
    mahshy: icon('<ellipse cx="60" cy="74" rx="50" ry="26" fill="#FFFFFF"/><ellipse cx="60" cy="72" rx="38" ry="17" fill="#F4EFE6" stroke="none"/>' +
      '<g fill="#6E8B3D"><rect x="30" y="58" width="26" height="12" rx="6" transform="rotate(-12 43 64)"/><rect x="52" y="54" width="26" height="12" rx="6" transform="rotate(8 65 60)"/><rect x="66" y="66" width="26" height="12" rx="6" transform="rotate(-6 79 72)"/><rect x="36" y="72" width="26" height="12" rx="6" transform="rotate(6 49 78)"/></g>' +
      '<path d="M30,66 Q50,58 62,68 T92,70" fill="none" stroke="#5A1F24" stroke-width="4"/>' +
      '<g stroke="none" fill="#D7263D"><circle cx="46" cy="60" r="2.6"/><circle cx="70" cy="62" r="2.6"/><circle cx="58" cy="80" r="2.6"/><circle cx="82" cy="70" r="2.6"/></g>'),
    frappe: icon('<path d="M66,10 L58,44" stroke-width="5" stroke="#E2456B"/><path d="M34,40 Q60,18 86,40 Z" fill="#FFF7EC"/>' +
      '<path d="M32,40 L88,40 L80,108 L40,108 Z" fill="#A86E43"/><path d="M36,62 Q60,70 84,62" fill="none" stroke="#F2D3A6" stroke-width="4"/>' +
      '<path d="M30,40 L90,40" stroke-width="5"/><path d="M44,32 Q50,26 56,32 Q62,26 68,32 Q74,26 78,32" fill="none" stroke="#C98A4B" stroke-width="3"/>'),
    tea: icon('<ellipse cx="60" cy="102" rx="40" ry="9" fill="#FFFFFF"/><path d="M38,36 L82,36 L77,96 Q60,104 43,96 Z" fill="#D8B086"/>' +
      '<path d="M40,46 L80,46" stroke="#F3E2C8" stroke-width="5"/><path d="M82,50 Q98,52 94,68 Q90,80 79,78" fill="none" stroke-width="5"/>' +
      '<path d="M50,26 Q46,18 52,12 M66,26 Q62,18 68,12" fill="none" stroke="#B9A89A" stroke-width="3"/>'),
    toycar: icon('<path d="M14,78 L22,56 L44,54 L56,38 L84,38 L96,56 L106,60 L106,80 Z" fill="#E2453A"/>' +
      '<path d="M48,55 L58,44 L70,44 L70,55 Z M76,55 L76,44 L82,44 L90,55 Z" fill="#9AD7F5"/>' +
      '<circle cx="36" cy="82" r="12" fill="#333"/><circle cx="36" cy="82" r="4" fill="#ccc"/><circle cx="86" cy="82" r="12" fill="#333"/><circle cx="86" cy="82" r="4" fill="#ccc"/>'),
    slippers: icon('<ellipse cx="40" cy="68" rx="20" ry="36" fill="#F6A6B8" transform="rotate(-12 40 68)"/><ellipse cx="82" cy="70" rx="20" ry="36" fill="#F6A6B8" transform="rotate(10 82 70)"/>' +
      '<path d="M22,52 Q40,40 58,48 L56,62 Q40,56 24,64 Z" fill="#E2456B"/><path d="M64,50 Q82,42 100,54 L98,66 Q82,58 66,64 Z" fill="#E2456B"/>' +
      '<circle cx="40" cy="52" r="5" fill="#fff"/><circle cx="82" cy="54" r="5" fill="#fff"/>'),
    cat: icon('<path d="M96,86 Q114,80 108,60 Q104,52 98,58" fill="none" stroke="#E08A2E" stroke-width="9"/>' +
      '<ellipse cx="66" cy="80" rx="38" ry="22" fill="#F2A44A"/><circle cx="34" cy="72" r="20" fill="#F2A44A"/>' +
      '<path d="M18,62 L20,44 L32,56 Z M38,54 L48,42 L50,60 Z" fill="#F2A44A"/>' +
      '<path d="M24,72 Q28,76 32,72 M38,72 Q42,76 46,72" fill="none" stroke-width="2.5"/><path d="M60,64 L66,66 M70,62 L76,64 M80,64 L86,66" stroke="#C46A1A" stroke-width="3"/>' +
      '<text x="70" y="40" font-family="Arial Black,Arial" font-size="18" fill="#7A6AE0" stroke="none">z</text><text x="86" y="26" font-family="Arial Black,Arial" font-size="13" fill="#7A6AE0" stroke="none">z</text>'),
    laundry: icon('<path d="M26,48 Q40,26 56,40 Q70,22 84,40 Q98,30 98,50 Z" fill="#7EC8F2"/><path d="M50,46 Q60,30 74,44" fill="#F6A6B8"/>' +
      '<path d="M18,48 L102,48 L92,106 L28,106 Z" fill="#E7C98F"/><path d="M24,64 L96,64 M26,80 L94,80 M28,96 L92,96" stroke="#B48A47" stroke-width="2.5"/>' +
      '<path d="M44,48 L46,106 M60,48 L60,106 M76,48 L74,106" stroke="#B48A47" stroke-width="2.5"/>'),
    medicine: icon('<rect x="20" y="34" width="80" height="62" rx="8" fill="#FFFFFF"/><rect x="20" y="34" width="80" height="16" rx="6" fill="#4FA3D9"/>' +
      '<path d="M60,58 L60,88 M45,73 L75,73" stroke="#E2453A" stroke-width="10"/>'),
    water: icon('<path d="M34,22 L86,22 L80,104 L40,104 Z" fill="#EAF7FD"/><path d="M37,48 L83,48 L80,104 L40,104 Z" fill="#7EC8F2"/>' +
      '<path d="M44,34 L46,92" stroke="#ffffff" stroke-width="5"/>'),
    blanket: icon('<rect x="14" y="70" width="92" height="28" rx="10" fill="#9C7BD4"/><rect x="18" y="48" width="84" height="26" rx="10" fill="#B497E6"/><rect x="22" y="28" width="76" height="24" rx="10" fill="#C9B1F2"/>' +
      '<path d="M30,40 L90,40 M28,61 L92,61 M24,84 L96,84" stroke="#fff" stroke-width="3" stroke-dasharray="6 6"/>'),
    soup: icon('<path d="M16,56 L104,56 Q100,100 60,104 Q20,100 16,56 Z" fill="#FFFFFF"/><ellipse cx="60" cy="56" rx="44" ry="10" fill="#F28C38"/>' +
      '<g stroke="none" fill="#7DB04A"><circle cx="46" cy="55" r="3"/><circle cx="66" cy="58" r="3"/><circle cx="78" cy="54" r="2.5"/></g>' +
      '<path d="M44,40 Q40,30 46,22 M60,40 Q56,30 62,20 M76,40 Q72,30 78,22" fill="none" stroke="#B9A89A" stroke-width="3"/>'),
    sock: icon('<path d="M44,14 L76,14 L76,70 Q78,94 56,102 Q30,108 24,92 Q22,80 40,74 L44,70 Z" fill="#7EC8F2"/>' +
      '<path d="M44,28 L76,28 M44,42 L76,42" stroke="#E2456B" stroke-width="6"/>'),
    book: icon('<rect x="24" y="20" width="70" height="84" rx="6" fill="#3E6FB6"/><rect x="86" y="24" width="10" height="76" rx="3" fill="#F7F2E6"/>' +
      '<rect x="36" y="38" width="44" height="12" rx="3" fill="#F2B63C"/>'),
    remote: icon('<rect x="40" y="10" width="40" height="100" rx="14" fill="#3A3A44"/><circle cx="60" cy="30" r="7" fill="#E2453A"/>' +
      '<g fill="#9AA0B4"><circle cx="50" cy="52" r="5"/><circle cx="70" cy="52" r="5"/><circle cx="50" cy="68" r="5"/><circle cx="70" cy="68" r="5"/><circle cx="50" cy="84" r="5"/><circle cx="70" cy="84" r="5"/></g>'),
    dumbbell: icon('<rect x="30" y="54" width="60" height="12" rx="5" fill="#9AA0B4"/><rect x="14" y="36" width="18" height="48" rx="6" fill="#3A3A44"/><rect x="88" y="36" width="18" height="48" rx="6" fill="#3A3A44"/>'),
    popcorn: icon('<g fill="#FFF6D6"><circle cx="34" cy="40" r="13"/><circle cx="52" cy="28" r="14"/><circle cx="70" cy="30" r="13"/><circle cx="86" cy="42" r="12"/><circle cx="60" cy="44" r="12"/></g>' +
      '<path d="M24,46 L96,46 L86,108 L34,108 Z" fill="#FFFFFF"/><path d="M38,46 L44,108 M58,46 L60,108 M80,46 L76,108" stroke="#E2453A" stroke-width="9"/>'),
    lights: icon('<path d="M8,30 Q60,70 112,30" fill="none" stroke-width="3"/>' +
      '<g><circle cx="22" cy="44" r="9" fill="#F2B63C"/><circle cx="44" cy="56" r="9" fill="#E2456B"/><circle cx="66" cy="58" r="9" fill="#7EC8F2"/><circle cx="88" cy="52" r="9" fill="#7DB04A"/><circle cx="106" cy="38" r="8" fill="#B497E6"/></g>' +
      '<g stroke="#F2B63C" stroke-width="2.5"><path d="M22,64 L22,74 M44,76 L44,86 M66,78 L66,88 M88,72 L88,82"/></g>'),
    rock: icon('<path d="M22,78 Q16,50 40,38 Q62,26 84,40 Q106,56 96,82 Q80,98 52,96 Q28,94 22,78 Z" fill="#A9A39A"/><path d="M44,56 Q52,50 60,56 M70,70 Q76,66 82,70" fill="none" stroke="#7F786F"/>'),
    paper: icon('<path d="M30,16 L78,16 L94,32 L94,104 L30,104 Z" fill="#FFFFFF"/><path d="M78,16 L78,32 L94,32" fill="#E8E2D6"/><path d="M42,46 L82,46 M42,60 L82,60 M42,74 L82,74 M42,88 L70,88" stroke="#9AA0B4" stroke-width="3"/>'),
    scissors: icon('<path d="M56,58 L100,20 M64,62 L104,40" stroke-width="7" stroke="#9AA0B4"/><path d="M56,58 L100,20 M64,62 L104,40" stroke-width="3"/>' +
      '<circle cx="34" cy="78" r="16" fill="#E2456B"/><circle cx="58" cy="92" r="16" fill="#E2456B"/><circle cx="34" cy="78" r="7" fill="#fff"/><circle cx="58" cy="92" r="7" fill="#fff"/>'),
    wallet: icon('<rect x="16" y="34" width="88" height="60" rx="10" fill="#8A5A34"/><path d="M60,34 L104,34 L104,70 L60,70 Q50,52 60,34 Z" fill="#A86E43"/><circle cx="68" cy="52" r="5" fill="#F2B63C"/>'),
    keys: icon('<circle cx="40" cy="40" r="20" fill="none" stroke-width="6" stroke="#C9A227"/><circle cx="40" cy="40" r="20" fill="none"/>' +
      '<path d="M54,52 L96,94 M78,76 L86,68 M88,86 L96,78" stroke-width="9" stroke="#D9DCE3"/><path d="M54,52 L96,94" fill="none"/>' +
      '<path d="M36,58 L30,102 M30,86 L40,88 M30,96 L38,98" stroke-width="8" stroke="#F2B63C"/>'),
    phone: icon('<rect x="34" y="10" width="52" height="100" rx="12" fill="#2C2C36"/><rect x="40" y="20" width="40" height="76" rx="5" fill="#8FD3F4"/>' + heart(60, 60, 1, '#E2456B')),
    sunglasses: icon('<path d="M10,48 L110,48" stroke-width="5"/><path d="M14,48 L52,48 L50,70 Q46,82 32,80 Q16,78 14,62 Z" fill="#2B2F45"/><path d="M68,48 L106,48 L106,62 Q104,78 88,80 Q74,82 70,70 Z" fill="#2B2F45"/>' +
      '<path d="M24,56 L36,68 M78,56 L90,68" stroke="#fff" stroke-width="2.5" opacity=".7"/>'),
    carkey: icon('<rect x="18" y="30" width="48" height="64" rx="18" fill="#2C2C36"/><circle cx="42" cy="50" r="7" fill="#9AA0B4"/><circle cx="42" cy="74" r="7" fill="#9AA0B4"/>' +
      '<path d="M66,62 L106,62 L106,72 L96,72 L96,80 L86,80 L86,72 L66,72 Z" fill="#D9DCE3"/>'),
    tree: icon('<rect x="52" y="70" width="16" height="40" rx="4" fill="#8A5A34"/><circle cx="60" cy="44" r="30" fill="#6FAE4B"/><circle cx="36" cy="62" r="18" fill="#7DBE58"/><circle cx="84" cy="62" r="18" fill="#7DBE58"/>'),
    plane: icon('<path d="M14,64 L106,52 Q114,52 110,60 Q106,66 96,68 L20,74 Z" fill="#FFFFFF"/><path d="M52,60 L76,22 L88,24 L74,58 Z" fill="#4FA3D9"/><path d="M50,70 L70,98 L80,96 L72,68 Z" fill="#4FA3D9"/><path d="M18,64 L12,46 L22,46 L32,62 Z" fill="#4FA3D9"/>'),
    coin: icon('<circle cx="60" cy="60" r="40" fill="#F2B63C"/><circle cx="60" cy="60" r="29" fill="#F7CC5E" stroke="#C9922B"/><text x="60" y="73" text-anchor="middle" font-family="Arial" font-weight="900" font-size="38" fill="#B07818" stroke="none">ج</text>'),
    roses: icon('<path d="M30,64 L60,112 L90,64 Z" fill="#F6A6B8"/><path d="M60,70 L48,44 M60,70 L60,40 M60,70 L74,44" stroke="#4F8A3A" stroke-width="5"/>' +
      '<g fill="#D7263D"><circle cx="44" cy="40" r="15"/><circle cx="76" cy="40" r="15"/><circle cx="60" cy="28" r="16"/></g>' +
      '<g fill="none" stroke="#8E1022" stroke-width="2.5"><path d="M38,40 Q44,32 50,40 Q44,46 40,42"/><path d="M70,40 Q76,32 82,40 Q76,46 72,42"/><path d="M53,28 Q60,19 67,28 Q60,35 55,30"/></g>' +
      '<path d="M48,84 L60,92 L72,84" fill="#E2456B"/>'),
    gold: icon('<path d="M18,26 Q60,92 102,26" fill="none" stroke="#C9922B" stroke-width="9"/><path d="M18,26 Q60,92 102,26" fill="none" stroke="#F7CC5E" stroke-width="4" stroke-dasharray="2 5"/>' +
      heart(60, 86, 1.6, '#F2B63C') + '<path d="M54,74 L58,78" stroke="#fff" stroke-width="3"/>'),
    chocolate: icon('<path transform="translate(60 62) scale(3.6)" d="M0,6 C-9,-3 -15,-9 -9,-15 C-4,-19 0,-15 0,-11 C0,-15 4,-19 9,-15 C15,-9 9,-3 0,6Z" fill="#7A3B2A" stroke-width=".8"/>' +
      '<path d="M60,22 L60,84 M22,36 Q60,50 98,36" stroke="#F2B63C" stroke-width="6" fill="none"/><circle cx="60" cy="40" r="7" fill="#F2B63C"/>'),
    teddy: icon('<circle cx="36" cy="32" r="13" fill="#B07A4A"/><circle cx="84" cy="32" r="13" fill="#B07A4A"/><ellipse cx="60" cy="88" rx="30" ry="24" fill="#B07A4A"/><circle cx="60" cy="52" r="28" fill="#C48A55"/>' +
      '<ellipse cx="60" cy="62" rx="12" ry="9" fill="#EBC9A0"/><circle cx="60" cy="58" r="4" fill="' + INK + '" stroke="none"/><circle cx="49" cy="46" r="3.5" fill="' + INK + '" stroke="none"/><circle cx="71" cy="46" r="3.5" fill="' + INK + '" stroke="none"/>' +
      heart(60, 94, 0.9, '#E2456B')),
    heart: icon(heart(60, 74, 3.2, '#E2456B')),
    gift: icon('<rect x="20" y="50" width="80" height="56" rx="6" fill="#E2456B"/><rect x="14" y="36" width="92" height="20" rx="5" fill="#F06A88"/><path d="M60,36 L60,106" stroke="#F2B63C" stroke-width="10"/>' +
      '<path d="M60,36 Q40,10 32,26 Q30,36 60,36 Q80,10 88,26 Q90,36 60,36" fill="#F2B63C"/>'),
    tv: icon('<rect x="12" y="22" width="96" height="66" rx="10" fill="#2C2C36"/><rect x="20" y="30" width="80" height="50" rx="5" fill="#7EC8F2"/><path d="M44,104 L60,88 L76,104" fill="none" stroke-width="5"/>' + heart(60, 62, 1.2, '#E2456B')),
    joke: icon('<circle cx="60" cy="60" r="40" fill="#F2B63C"/><path d="M38,50 Q44,42 50,50 M70,50 Q76,42 82,50" fill="none" stroke-width="4"/><path d="M36,66 Q60,96 84,66 Z" fill="#8A2F35"/>'),
    cuddle: icon(heart(46, 70, 2, '#F06A88') + heart(74, 64, 2.2, '#E2456B')),
    talk: icon('<path d="M14,22 L82,22 Q92,22 92,32 L92,60 Q92,70 82,70 L44,70 L28,86 L30,70 L24,70 Q14,70 14,60 Z" fill="#FFFFFF"/><path d="M50,54 L100,54 Q108,54 108,62 L108,86 Q108,94 100,94 L96,94 L98,106 L84,94 L50,94 Q42,94 42,86 L42,62 Q42,54 50,54 Z" fill="#F6A6B8"/>' + heart(75, 80, 0.9, '#E2456B')),
    hug: icon('<circle cx="40" cy="42" r="16" fill="#F2C9A8"/><circle cx="80" cy="42" r="16" fill="#C68E6C"/><path d="M14,104 Q14,64 40,62 Q60,62 60,80 Q60,62 80,62 Q106,64 106,104 Z" fill="#6E7A44"/>' + heart(60, 30, 1, '#E2456B')),
    surprise: icon('<rect x="20" y="50" width="80" height="56" rx="6" fill="#7EC8F2"/><rect x="14" y="36" width="92" height="20" rx="5" fill="#9FD8F7"/><path d="M60,36 L60,106" stroke="#E2456B" stroke-width="10"/>' +
      '<path d="M30,26 L22,14 M90,26 L98,14 M60,22 L60,8" stroke="#F2B63C" stroke-width="5"/>'),
    trophy: icon('<path d="M34,18 L86,18 L84,48 Q80,72 60,74 Q40,72 36,48 Z" fill="#F2B63C"/><path d="M34,26 Q14,26 18,42 Q22,54 36,52 M86,26 Q106,26 102,42 Q98,54 84,52" fill="none" stroke-width="5"/>' +
      '<rect x="52" y="74" width="16" height="16" fill="#C9922B"/><rect x="36" y="90" width="48" height="14" rx="4" fill="#8A5A34"/>')
  };

  /* ---------- backgrounds, 390 x 844, flat and slightly muted so stickers pop ---------- */
  const W = 390, H = 844;
  const bg = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;
  const frame = (x, y, w, h, inner) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#8A5A34"/><rect x="${x + 7}" y="${y + 7}" width="${w - 14}" height="${h - 14}" fill="#FFF7EA"/>${inner || ''}`;
  const window_ = (x, y, w, h, sky, extra) => `<rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 16}" rx="8" fill="#FFFFFF"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${sky}"/>${extra || ''}<path d="M${x + w / 2},${y} L${x + w / 2},${y + h} M${x},${y + h / 2} L${x + w},${y + h / 2}" stroke="#FFFFFF" stroke-width="6"/>`;
  const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#FFFFFF"><circle cx="0" cy="0" r="16"/><circle cx="18" cy="-8" r="20"/><circle cx="38" cy="0" r="16"/><rect x="0" y="0" width="38" height="16"/></g>`;

  const BG = {
    menu: bg(`<rect width="${W}" height="${H}" fill="#FCE3D3"/>` +
      Array.from({ length: 18 }, (_, i) => { const a1 = (i * 20) * Math.PI / 180, a2 = (i * 20 + 10) * Math.PI / 180, R = 1200, cx = 195, cy = 420;
        return `<path d="M${cx},${cy} L${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)} L${cx + R * Math.cos(a2)},${cy + R * Math.sin(a2)} Z" fill="#FBD3C0"/>`; }).join('') +
      `<circle cx="195" cy="420" r="150" fill="#FCE3D3" opacity=".6"/>`),
    living: bg(`<rect width="${W}" height="${H}" fill="#F7E2C4"/>` +
      Array.from({ length: 13 }, (_, i) => `<rect x="${i * 32}" y="0" width="14" height="610" fill="#F2D8B4"/>`).join('') +
      window_(110, 120, 170, 160, '#BFE6FA', cloud(140, 170, 0.8) + `<circle cx="240" cy="160" r="18" fill="#FFD866"/>`) +
      `<rect x="88" y="100" width="40" height="230" rx="10" fill="#4FA39A"/><rect x="262" y="100" width="40" height="230" rx="10" fill="#4FA39A"/><rect x="80" y="94" width="230" height="10" rx="5" fill="#8A5A34"/>` +
      frame(26, 150, 52, 64, `<path transform="translate(52 186) scale(1.2)" d="M0,6 C-9,-3 -15,-9 -9,-15 C-4,-19 0,-15 0,-11 C0,-15 4,-19 9,-15 C15,-9 9,-3 0,6Z" fill="#E2456B"/>`) +
      frame(318, 170, 50, 50, `<circle cx="343" cy="195" r="12" fill="#F2B63C"/>`) +
      `<rect x="0" y="610" width="${W}" height="${H - 610}" fill="#C98F5B"/>` +
      Array.from({ length: 8 }, (_, i) => `<path d="M0,${640 + i * 28} L${W},${640 + i * 28}" stroke="#B87D4B" stroke-width="3"/>`).join('') +
      `<rect x="0" y="600" width="${W}" height="14" fill="#FFFFFF"/>` +
      `<ellipse cx="195" cy="740" rx="170" ry="52" fill="#E2456B" opacity=".85"/><ellipse cx="195" cy="740" rx="140" ry="38" fill="none" stroke="#F6A6B8" stroke-width="6" stroke-dasharray="14 10"/>` +
      `<rect x="20" y="520" width="48" height="84" rx="6" fill="#E07A4A"/><g fill="#5E9A47"><ellipse cx="44" cy="500" rx="16" ry="38"/><ellipse cx="26" cy="510" rx="12" ry="30" transform="rotate(-25 26 510)"/><ellipse cx="62" cy="510" rx="12" ry="30" transform="rotate(25 62 510)"/></g>` +
      `<rect x="332" y="410" width="6" height="190" fill="#3A3A44"/><path d="M308,410 L362,410 L352,370 L318,370 Z" fill="#F2B63C"/><ellipse cx="335" cy="602" rx="22" ry="6" fill="#3A3A44"/>`),
    kitchen: bg(`<rect width="${W}" height="${H}" fill="#E4F2EA"/>` +
      Array.from({ length: 14 }, (_, i) => `<path d="M${i * 30},0 L${i * 30},560 M0,${i * 40} L${W},${i * 40}" stroke="#D2E7DB" stroke-width="3"/>`).join('') +
      `<rect x="0" y="60" width="250" height="150" fill="#7C8A3F"/><path d="M83,60 L83,210 M166,60 L166,210" stroke="#5E6A2C" stroke-width="4"/><g fill="#F2B63C"><circle cx="70" cy="190" r="5"/><circle cx="96" cy="190" r="5"/><circle cx="153" cy="190" r="5"/><circle cx="179" cy="190" r="5"/></g>` +
      `<rect x="270" y="150" width="120" height="460" rx="12" fill="#FFFFFF" stroke="#C9D6CF" stroke-width="4"/><path d="M270,330 L390,330" stroke="#C9D6CF" stroke-width="4"/><rect x="284" y="200" width="8" height="90" rx="4" fill="#9AA0B4"/><rect x="284" y="350" width="8" height="120" rx="4" fill="#9AA0B4"/>` +
      `<rect x="300" y="190" width="30" height="36" fill="#F6A6B8"/><rect x="336" y="200" width="26" height="26" fill="#FFD866"/>` +
      `<rect x="0" y="440" width="260" height="30" fill="#E7D2B0"/><rect x="0" y="470" width="260" height="140" fill="#7C8A3F"/><path d="M86,470 L86,610 M172,470 L172,610" stroke="#5E6A2C" stroke-width="4"/>` +
      `<rect x="40" y="420" width="70" height="22" rx="4" fill="#3A3A44"/><path d="M50,412 L100,412 L96,380 L54,380 Z" fill="#E2453A"/><path d="M64,370 Q60,350 68,336 M84,370 Q80,350 88,336" fill="none" stroke="#B9C9C0" stroke-width="4"/>` +
      `<rect x="0" y="610" width="${W}" height="${H - 610}" fill="#FFFFFF"/>` +
      Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => (r + c) % 2 ? '' : `<rect x="${c * 50}" y="${610 + r * 40}" width="50" height="40" fill="#E2EEF5"/>`).join('')).join('')),
    bedroom: bg(`<rect width="${W}" height="${H}" fill="#EADFF2"/>` +
      Array.from({ length: 20 }, (_, i) => `<circle cx="${(i * 73) % 390}" cy="${40 + (i * 97) % 520}" r="4" fill="#DCCBEA"/>`).join('') +
      window_(220, 110, 130, 150, '#BFE6FA', `<circle cx="320" cy="150" r="16" fill="#FFD866"/>` + cloud(240, 200, 0.6)) +
      frame(40, 130, 110, 80, `<path transform="translate(95 176) scale(1.6)" d="M0,6 C-9,-3 -15,-9 -9,-15 C-4,-19 0,-15 0,-11 C0,-15 4,-19 9,-15 C15,-9 9,-3 0,6Z" fill="#E2456B"/><text x="95" y="200" text-anchor="middle" font-family="Arial" font-weight="700" font-size="12" fill="#8A5A34">م + ج</text>`) +
      `<rect x="0" y="560" width="${W}" height="${H - 560}" fill="#C7B0DE"/><rect x="0" y="552" width="${W}" height="12" fill="#FFFFFF"/>` +
      `<rect x="300" y="440" width="76" height="120" rx="6" fill="#B07A4A"/><path d="M300,500 L376,500" stroke="#8A5A34" stroke-width="4"/><circle cx="338" cy="470" r="4" fill="#F2B63C"/><circle cx="338" cy="530" r="4" fill="#F2B63C"/>` +
      `<rect x="334" y="390" width="8" height="50" fill="#3A3A44"/><path d="M314,394 L362,394 L354,356 L322,356 Z" fill="#F6A6B8"/>`),
    cafe: bg(`<rect width="${W}" height="${H}" fill="#E9C9A6"/>` +
      Array.from({ length: 14 }, (_, r) => Array.from({ length: 8 }, (_, c) => `<rect x="${c * 56 - (r % 2) * 28}" y="${r * 34}" width="52" height="30" rx="3" fill="#E1B98F"/>`).join('')).join('') +
      `<rect x="40" y="110" width="310" height="190" rx="10" fill="#2F4A3A" stroke="#8A5A34" stroke-width="10"/>` +
      `<text x="195" y="160" text-anchor="middle" font-family="Arial" font-weight="900" font-size="26" fill="#FFF7EA">المنيو</text>` +
      `<text x="320" y="205" text-anchor="end" font-family="Arial" font-weight="700" font-size="18" fill="#FFF7EA">موكا فرابيه</text><text x="70" y="205" font-family="Arial" font-weight="700" font-size="18" fill="#F2B63C">♥</text>` +
      `<text x="320" y="240" text-anchor="end" font-family="Arial" font-weight="700" font-size="18" fill="#FFF7EA">شاي بلبن</text><text x="320" y="275" text-anchor="end" font-family="Arial" font-weight="700" font-size="18" fill="#FFF7EA">كرواسون</text>` +
      [80, 195, 310].map(x => `<path d="M${x},0 L${x},340" stroke="#3A3A44" stroke-width="3"/><path d="M${x - 26},366 Q${x},326 ${x + 26},366 Z" fill="#F2B63C"/><circle cx="${x}" cy="372" r="8" fill="#FFF3B0"/>`).join('') +
      `<rect x="0" y="560" width="${W}" height="${H - 560}" fill="#8A5A34"/><rect x="0" y="540" width="${W}" height="30" fill="#B07A4A"/>` +
      Array.from({ length: 6 }, (_, i) => `<path d="M0,${600 + i * 40} L${W},${600 + i * 40}" stroke="#7A4C2A" stroke-width="3"/>`).join('')),
    restaurant: bg(`<rect width="${W}" height="${H}" fill="#7A2E3A"/>` +
      Array.from({ length: 13 }, (_, i) => `<rect x="${i * 32}" y="0" width="12" height="560" fill="#6E2632"/>`).join('') +
      window_(90, 100, 210, 170, '#283A6B', `<circle cx="260" cy="140" r="16" fill="#FFF3B0"/>` + Array.from({ length: 12 }, (_, i) => `<circle cx="${100 + (i * 37) % 190}" cy="${120 + (i * 29) % 70}" r="2" fill="#FFF3B0"/>`).join('') +
        `<path d="M90,270 L90,230 L120,230 L120,210 L150,210 L150,240 L190,240 L190,200 L220,200 L220,250 L260,250 L260,225 L300,225 L300,270 Z" fill="#1C2547"/>`) +
      `<rect x="0" y="540" width="${W}" height="${H - 540}" fill="#FFFFFF"/>` +
      Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => (r + c) % 2 ? '' : `<rect x="${c * 50}" y="${540 + r * 40}" width="50" height="40" fill="#E2456B" opacity=".55"/>`).join('')).join('') +
      [120, 270].map(x => `<rect x="${x - 6}" y="470" width="12" height="70" fill="#FFF7EA" stroke="#2a1a1a" stroke-width="2"/><path d="M${x},468 Q${x - 8},452 ${x},440 Q${x + 8},452 ${x},468 Z" fill="#F2B63C"/>`).join('')),
    park: bg(`<rect width="${W}" height="${H}" fill="#BFE6FA"/><circle cx="320" cy="110" r="40" fill="#FFD866"/>` + cloud(40, 120, 1.1) + cloud(200, 200, 0.8) +
      `<path d="M0,430 Q100,380 200,420 T390,410 L390,${H} L0,${H} Z" fill="#9CCB6B"/><path d="M0,520 Q120,480 240,520 T390,510 L390,${H} L0,${H} Z" fill="#7DBE58"/>` +
      [[40, 400], [330, 390], [120, 470]].map(([x, y]) => `<rect x="${x - 8}" y="${y - 10}" width="16" height="70" fill="#8A5A34"/><circle cx="${x}" cy="${y - 30}" r="40" fill="#5E9A47"/><circle cx="${x - 26}" cy="${y - 8}" r="24" fill="#6FAE4B"/><circle cx="${x + 26}" cy="${y - 8}" r="24" fill="#6FAE4B"/>`).join('') +
      `<path d="M150,${H} Q200,700 230,600 Q250,560 300,540" fill="none" stroke="#E7D2B0" stroke-width="70"/>` +
      Array.from({ length: 14 }, (_, i) => `<circle cx="${(i * 61) % 390}" cy="${600 + (i * 43) % 220}" r="5" fill="${['#F6A6B8', '#FFD866', '#FFFFFF'][i % 3]}"/>`).join('')),
    travel: bg(`<rect width="${W}" height="${H}" fill="#DCE6EE"/>` +
      `<rect x="0" y="70" width="${W}" height="330" fill="#9FD3F2"/>` + cloud(30, 150, 1) + cloud(250, 120, 0.8) +
      `<rect x="0" y="330" width="${W}" height="70" fill="#8C99A6"/><path d="M0,365 L${W},365" stroke="#FFFFFF" stroke-width="4" stroke-dasharray="20 16"/>` +
      `<g transform="translate(110 250) scale(1.6)"><path d="M14,64 L106,52 Q114,52 110,60 Q106,66 96,68 L20,74 Z" fill="#FFFFFF" stroke="#2a1a1a" stroke-width="2"/><path d="M52,60 L76,22 L88,24 L74,58 Z" fill="#E2456B" stroke="#2a1a1a" stroke-width="2"/><path d="M18,64 L12,46 L22,46 L32,62 Z" fill="#E2456B" stroke="#2a1a1a" stroke-width="2"/></g>` +
      Array.from({ length: 6 }, (_, i) => `<rect x="${i * 70 - 10}" y="70" width="10" height="330" fill="#5B6B7A"/>`).join('') +
      `<rect x="30" y="430" width="330" height="120" rx="10" fill="#1F2A36"/><text x="340" y="462" text-anchor="end" font-family="Arial" font-weight="900" font-size="16" fill="#F2B63C">رحلات السفر</text>` +
      `<text x="340" y="494" text-anchor="end" font-family="Arial" font-weight="700" font-size="16" fill="#FFF7EA">باريس</text><text x="50" y="494" font-family="Arial" font-weight="700" font-size="16" fill="#7DBE58">✈ ركوب</text><text x="340" y="524" text-anchor="end" font-family="Arial" font-weight="700" font-size="16" fill="#FFF7EA">روما</text><text x="50" y="524" font-family="Arial" font-weight="700" font-size="16" fill="#FFF7EA">✈ في الميعاد</text>` +
      `<rect x="0" y="560" width="${W}" height="${H - 560}" fill="#C9D3DC"/>` + Array.from({ length: 6 }, (_, i) => `<path d="M${i * 80},560 L${i * 80 - 60},${H}" stroke="#B7C2CC" stroke-width="3"/>`).join('')),
    shop: bg(`<rect width="${W}" height="${H}" fill="#FBD9E3"/>` +
      `<rect x="40" y="60" width="310" height="70" rx="12" fill="#E2456B"/><text x="195" y="106" text-anchor="middle" font-family="Arial" font-weight="900" font-size="28" fill="#FFFFFF">محل الهدايا</text>` +
      [200, 330, 460].map(y => `<rect x="20" y="${y}" width="350" height="12" rx="4" fill="#B07A4A"/>` +
        [50, 130, 210, 290].map((x, i) => `<rect x="${x}" y="${y - 50 + (i % 2) * 14}" width="56" height="${50 - (i % 2) * 14}" rx="4" fill="${['#7EC8F2', '#F2B63C', '#B497E6', '#7DB04A'][(i + y / 10) % 4 | 0]}" opacity=".8"/><path d="M${x + 28},${y - 50 + (i % 2) * 14} L${x + 28},${y}" stroke="#FFFFFF" stroke-width="5"/>`).join('')).join('') +
      `<rect x="0" y="560" width="${W}" height="${H - 560}" fill="#F3EEE6"/>` + Array.from({ length: 6 }, (_, i) => `<path d="M0,${590 + i * 45} L${W},${590 + i * 45}" stroke="#E5DDD0" stroke-width="3"/>`).join(''))
  };

  const uri = (svg) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  window.ART = {
    item: (k) => uri(ITEMS[k]),
    bg: (k) => uri(BG[k]),
    items: Object.keys(ITEMS),
    bgs: Object.keys(BG)
  };
})();
