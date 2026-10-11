import { esc, num, page, tierChip, table, WIKI_PAGES, wikiSlug } from './layout.mjs';

const ELEMENT = { tr: { flame: 'Alev', glacier: 'Buz', lightning: 'Yıldırım', poison: 'Zehir', holy: 'Kutsal', dark: 'Karanlık', ice: 'Buz' }, en: { flame: 'Flame', glacier: 'Frost', lightning: 'Lightning', poison: 'Poison', holy: 'Holy', dark: 'Dark', ice: 'Frost' } };
const SLOT_LABEL = { tr: { head: 'Kask', chest: 'Göğüslük', legs: 'Don/Bacaklık', gauntlets: 'Eldiven', boots: 'Bot', earring: 'Küpe', necklace: 'Kolye', ring: 'Yüzük', belt: 'Kemer' }, en: { head: 'Helm', chest: 'Chestplate', legs: 'Leggings', gauntlets: 'Gauntlets', boots: 'Boots', earring: 'Earring', necklace: 'Necklace', ring: 'Ring', belt: 'Belt' } };
const CLASS_NAME = { tr: { warrior: 'Warrior', rogue: 'Rogue (Okçu)', mage: 'Mage' }, en: { warrior: 'Warrior', rogue: 'Rogue (Archer)', mage: 'Mage' } };
const CLASS_BLURB = {
  tr: {
    warrior: 'Ön safın sağlam savaşçısı. Yüksek can ve savunmayla boss karşılaşmalarında ekibi taşır.',
    rogue: 'Menzilli okçu. Hızlı atışlar ve yüksek kritik şansıyla hasarı uzaktan, hızla verir.',
    mage: 'Yıkıcı büyüleriyle en yüksek hasarı verir ama canı düşüktür; mana yönetimi her şeydir.',
  },
  en: {
    warrior: 'A sturdy fighter of the front line. High health and defense carry the team through boss fights.',
    rogue: 'A ranged archer. Fast shots and a high crit chance deal damage quickly from a distance.',
    mage: 'Deals the highest damage with devastating spells, but has low health; mana management is everything.',
  },
};
const STAT_SHORT = { str: 'STR', sta: 'STA', dex: 'DEX', int: 'INT', mag: 'MPW' };

export function buildPages(data, lang = 'tr') {
  const en = lang === 'en';
  const L = (tr, enText) => (en ? enText : tr);
  const E = data.en;
  const pages = {};
  const prefix = en ? 'en/' : '';
  // Sayfa içi bağlantılar: assetRoot sitenin köküne, R bu dilin köküne göreli (wiki sayfaları bir klasör içeride)
  const A = en ? '../../' : '../';
  const R = '../';
  const wiki = (slug, title, description, body) => {
    const file = `wiki/${slug === 'index' ? 'index' : wikiSlug(lang, slug)}.html`;
    pages[prefix + file] = page({ title, description, body, active: 'wiki', wikiActive: slug, lang, path: prefix + file });
  };
  const maps = data.maps;
  const weaponsOf = (cls) => data.weapons.filter((w) => w.cls === cls).sort((a, b) => a.tier - b.tier || a.levelMin - b.levelMin);

  // Veri adlarının dile göre karşılıkları
  const monsterName = (id, fallback) => (en ? E.monsters[id] || fallback : fallback);
  const dungeonStageName = (m, s) => {
    if (!en) return s.name;
    if (E.monsters[s.id]) return E.monsters[s.id];
    const match = /^dungeon_[a-z_]+?_(\d+)$/.exec(s.id || '');
    const base = m.monsters[m.monsters.length - 1];
    return match && E.monsters[base.id] ? `${E.monsters[base.id]} (Dungeon ${match[1]})` : s.name;
  };
  const weaponName = (w) => (en ? E.weaponNames[w.name] || w.name : w.name);
  const weaponLore = (w) => String((en ? E.weaponLore[w.name] || '' : w.lore) || '').replace(/^\*+|\*+$/g, '');
  const tierLabel = (tier) => (en ? E.tierLabels[tier] : data.tiers.labels[tier]);
  const chip = (tier) => `<span class="tier" style="--c:${data.tiers.colors[tier]}">${esc(tierLabel(tier))}</span>`;
  const typeLabel = (t) => esc((en ? E.weaponTypeLabels : data.weaponTypeLabels)[t] || t);
  const statLabel = (k) => (en ? E.stats[k] : data.stats.labels[k]) || k;

  function effectText(effect) {
    if (!effect) return '';
    const pct = (v) => `${en ? '' : '%'}${Math.round(v * 100)}${en ? '%' : ''}`;
    switch (effect.type) {
      case 'damage': return L(`${effect.mult}× hasar`, `${effect.mult}× damage`);
      case 'heal': return L(`Canın ${pct(effect.pct)} kadarını yeniler`, `Restores ${pct(effect.pct)} of your health`);
      case 'buffAtk': return L(`Saldırıyı ${effect.mult}× artırır (${effect.turns} tur)`, `Raises attack ×${effect.mult} (${effect.turns} turns)`);
      case 'dot': return L(`${effect.turns} tur boyunca süren hasar (${effect.mult}×)`, `Damage over ${effect.turns} turns (${effect.mult}×)`);
      case 'execute': return L(`Hedefin canı ${pct(effect.hpPctThreshold)} altındaysa ${effect.mult}× hasar`, `${effect.mult}× damage if the target is below ${pct(effect.hpPctThreshold)} health`);
      default: return effect.type;
    }
  }

  // ---------------- Wiki: başlangıç
  wiki('index', L('Wiki · Başlangıç rehberi', 'Wiki · Getting started'), L('Nyxia Online oyun rehberi: sınıflar, bölgeler, silahlar, klanlar ve daha fazlası.', 'Nyxia Online game guide: classes, regions, weapons, clans and more.'), `
    <h1>Nyxia Online Wiki</h1>
    <p class="lead">${L(`Nyxia Online bir mobil online RPG. Üç sınıftan biriyle başlar, ${maps.length} bölgeyi aşar, klanınla boss'ları devirir ve savaş alanında sıralamaya girersin. Bu wiki, oyunun kendi verisinden otomatik üretilir; sayılar oyunla birebir aynıdır.`,
      `Nyxia Online is a mobile online RPG. Start with one of three classes, clear ${maps.length} regions, take down bosses with your clan and climb the ranking in the Warzone. This wiki is generated automatically from the game's own data, so the numbers match the game exactly.`)}</p>
    <div class="callout">${L('<strong>Tek cümleyle:</strong> avlan, seviye atla, eşyalarını geliştir, klanla güçlen. Hesabın sunucuda saklanır; telefonunu değiştirsen de kaldığın yerden devam edersin.',
      '<strong>In one sentence:</strong> hunt, level up, upgrade your gear and grow stronger with your clan. Your account is stored on the server, so you continue where you left off even if you change phones.')}</div>
    <h2>${L('Hızlı başlangıç', 'Quick start')}</h2>
    <ol class="steps">
      <li>${L('<strong>Irkını ve sınıfını seç.</strong> İnsan veya Ork; Warrior, Rogue ya da Mage. Hesaptaki ırk tüm karakterlerin için aynıdır.', '<strong>Pick your race and class.</strong> Human or Orc; Warrior, Rogue or Mage. The race is shared by all characters on your account.')}</li>
      <li>${L(`<strong>Fallow Valley'de avlan.</strong> Canavarları yen, deneyim ve altın kazan. Her seviyede <strong>${data.stats.pointsPerLevel} statü puanı</strong> kazanırsın (en çok ${data.stats.cap} puana kadar).`, `<strong>Hunt in Fallow Valley.</strong> Defeat monsters, earn experience and gold. You gain <strong>${data.stats.pointsPerLevel} stat points</strong> per level (up to ${data.stats.cap} points in a stat).`)}</li>
      <li>${L('<strong>Eşya düşür, kuşan.</strong> Silah, zırh ve takı bul; seviye ve statü şartını karşılayanı giy.', '<strong>Collect and equip gear.</strong> Find weapons, armor and accessories; wear what matches your level and stat requirements.')}</li>
      <li>${L('<strong>Günlük görevleri yap.</strong> Günlük giriş ödülü, günlük/haftalık görevler ve günlük zindan hakkın her gün yenilenir.', '<strong>Do your daily tasks.</strong> The daily login reward, daily/weekly quests and your daily dungeon entries renew every day.')}</li>
      <li>${L("<strong>Klana katıl.</strong> Klan zindanı, ortak depo ve klan boss'u tek başına ulaşamayacağın ödüller verir.", '<strong>Join a clan.</strong> The clan dungeon, shared vault and clan boss give rewards you cannot reach alone.')}</li>
    </ol>
    <h2>${L('Wiki bölümleri', 'Wiki sections')}</h2>
    <div class="cards">${WIKI_PAGES.filter(([s]) => s !== 'index').map(([slug, trLabel, enLabel]) => `<a class="card link" href="${wikiSlug(lang, slug)}.html"><h3>${esc(en ? enLabel : trLabel)}</h3></a>`).join('')}</div>
  `);

  // ---------------- Sınıflar
  const raceName = (r) => (en ? E.races[r.id]?.name || r.name : r.name);
  const raceDesc = (r) => (en ? E.races[r.id]?.desc || r.desc : r.desc);
  const classCard = (c) => `
    <section class="class" id="${c.id}" style="--c:${c.color}">
      <div class="class-head">
        <img src="${A}img/chars/${c.id}-human.webp" alt="${esc(c.name)} ${L('İnsan', 'Human')}" loading="lazy">
        <img src="${A}img/chars/${c.id}-orc.webp" alt="${esc(c.name)} ${L('Ork', 'Orc')}" loading="lazy">
        <div><h2>${esc(CLASS_NAME[lang][c.id] || c.name)}</h2><p>${esc(CLASS_BLURB[lang][c.id] || c.desc)}</p></div>
      </div>
      ${table([L('Özellik', 'Attribute'), L('Başlangıç değeri', 'Starting value')], [
        [L('Saldırı', 'Attack'), c.atk], [L('Savunma', 'Defense'), c.def], [L('Can', 'Health'), c.maxHp], [L('Mana', 'Mana'), c.maxMp], [L('Kritik şansı', 'Crit chance'), L(`%${Math.round(c.crit * 100)}`, `${Math.round(c.crit * 100)}%`)],
        [L('Ana statü', 'Main stat'), esc(statLabel(c.mainStat))],
        [L('Başlangıç statüleri', 'Starting stats'), Object.entries(c.baseStats).map(([k, v]) => `${STAT_SHORT[k]} ${v}`).join(' · ')],
      ])}
      <h3>${L('Yetenekler', 'Skills')}</h3>
      <p class="muted">${L(`Aynı anda en fazla ${data.loadoutSlots} yetenek kuşanabilirsin. Gelişmiş yetenekler altın ve görev ister.`, `You can equip up to ${data.loadoutSlots} skills at a time. Advanced skills require gold and a quest.`)}</p>
      ${table([L('Yetenek', 'Skill'), L('Seviye', 'Level'), 'Mana', L('Bekleme', 'Cooldown'), L('Etki', 'Effect'), L('Altın', 'Gold')], data.skills[c.id].map((s) => [`<strong>${esc(en ? E.skills[s.id] || s.name : s.name)}</strong>`, s.unlockLevel, s.mpCost, s.cooldown ? L(`${s.cooldown} tur`, `${s.cooldown} turns`) : '—', esc(effectText(s.effect)), s.goldCost ? num(s.goldCost) : '—']))}
    </section>`;
  wiki('siniflar', L('Wiki · Sınıflar ve yetenekler', 'Wiki · Classes and skills'), L('Warrior, Rogue ve Mage: başlangıç değerleri ve tüm yetenekler.', 'Warrior, Rogue and Mage: starting values and every skill.'), `
    <h1>${L('Sınıflar ve yetenekler', 'Classes and skills')}</h1>
    <p class="lead">${L('Üç sınıf, iki ırk. Irk görünümü değiştirir; sınıf oynanışını belirler.', 'Three classes, two races. The race changes your look; the class defines how you play.')}</p>
    <div class="cards two">${data.races.map((r) => `<div class="card" style="--c:${r.color}"><h3>${esc(raceName(r))}</h3><p>${esc(raceDesc(r))}</p></div>`).join('')}</div>
    ${data.classes.map(classCard).join('')}
  `);

  // ---------------- Bölgeler
  const regionBlock = (m) => `
    <section class="region" id="${m.id}" style="--c:${m.color}">
      <div class="region-art" style="background-image:url(${A}img/regions/${m.id}.webp)"><div><h2>${esc(m.name)}</h2><span class="pill">${L('Seviye', 'Level')} ${m.levelMin}–${m.levelMax}</span></div></div>
      ${table([L('Canavar', 'Monster'), L('Can', 'Health'), L('Saldırı', 'Attack'), L('Savunma', 'Defense'), L('Deneyim', 'Experience')], m.monsters.map((x) => [`<strong>${esc(monsterName(x.id, x.name))}</strong>`, num(x.hp), num(x.atk), num(x.def), num(x.xp)]))}
      <p class="muted">${L(`<strong>Harita sonu boss'u:</strong> ${esc(m.boss.name)}. Can ${num(m.boss.hp)}, saldırı ${num(m.boss.atk)}, savunma ${num(m.boss.def)}. Günde bir kez yenilebilir ve garantili sandık verir.`,
        `<strong>Map-end boss:</strong> ${esc(monsterName(m.boss.id, m.boss.name))}. Health ${num(m.boss.hp)}, attack ${num(m.boss.atk)}, defense ${num(m.boss.def)}. It can be defeated once a day and drops a guaranteed chest.`)}</p>
      <img class="bestiary" src="${A}img/bestiary/${m.id}.webp" alt="${esc(m.name)} ${L('canavarları', 'monsters')}" loading="lazy">
    </section>`;
  wiki('bolgeler', L('Wiki · Bölgeler ve canavarlar', 'Wiki · Regions and monsters'), L('Nyxia Online haritaları, seviye aralıkları ve canavar istatistikleri.', 'Nyxia Online maps, level ranges and monster stats.'), `
    <h1>${L('Bölgeler ve canavarlar', 'Regions and monsters')}</h1>
    <p class="lead">${L(`${maps.length} bölge seviyene göre açılır. Bölgedeki canavarların çoğunu yenince harita sonu boss'u kilidi açılır.`, `${maps.length} regions unlock as you level. Defeating most monsters in a region unlocks its map-end boss.`)}</p>
    <div class="chips">${maps.map((m) => `<a href="#${m.id}" style="--c:${m.color}">${esc(m.name)} <small>${m.levelMin}–${m.levelMax}</small></a>`).join('')}</div>
    ${maps.map(regionBlock).join('')}
    <p class="muted">${L('Bir bölgeden başkasına geçmek için kapı kullanılır; ışınlanma altın ister.', 'Use the gate to travel between regions; teleporting costs gold.')}</p>
  `);

  // ---------------- Zindanlar
  const soloSample = maps[0].dungeon;
  wiki('zindanlar', L('Wiki · Zindanlar ve bosslar', 'Wiki · Dungeons and bosses'), L('Günlük solo zindan, harita sonu boss, klan zindanı ve klan boss rehberi.', 'Guide to the daily solo dungeon, map-end bosses, the clan dungeon and the clan boss.'), `
    <h1>${L('Zindanlar ve bosslar', 'Dungeons and bosses')}</h1>
    <h2>${L('Günlük solo zindan', 'Daily solo dungeon')}</h2>
    <p>${L(`Her haritanın kendi zindanı var: ${data.solo.stages} aşama, her aşama bir öncekinden güçlü, sonunda zindan efendisi. Günde <strong>${data.solo.dailyLimit} giriş hakkın</strong> var, yeni hak ${num(data.solo.extraCost)} elmasa alınabilir. Girmeden önce oyun sana hakkını hatırlatıp onay ister.`,
      `Every map has its own dungeon: ${data.solo.stages} stages, each tougher than the last, ending with the dungeon lord. You get <strong>${data.solo.dailyLimit} entries a day</strong>, and an extra entry costs ${num(data.solo.extraCost)} diamonds. The game reminds you of your entries and asks for confirmation before you enter.`)}</p>
    ${table([L('Aşama (örnek: ', 'Stage (example: ') + esc(maps[0].name) + ')', L('Can', 'Health'), L('Saldırı', 'Attack'), L('Savunma', 'Defense')], soloSample.map((s) => [esc(dungeonStageName(maps[0], s)) + (s.isBoss ? ' <span class="pill">Boss</span>' : ''), num(s.hp), num(s.atk), num(s.def)]))}
    <h2>${L("Harita sonu boss'ları", 'Map-end bosses')}</h2>
    <p>${L(`Bölgenin canavarlarını yeterince yenince boss açılır. <strong>Günde bir kez</strong> yenilebilir; ödül olarak altın, deneyim ve garantili bir Muhafız Sandığı verir. Boss'a girmeden önce oyun onay ister, çünkü zordur.`,
      `Defeat enough of a region's monsters to unlock its boss. It can be defeated <strong>once a day</strong> and rewards gold, experience and a guaranteed Guardian Chest. The game asks for confirmation before you enter, because it is tough.`)}</p>
    ${table([L('Bölge', 'Region'), 'Boss', L('Can', 'Health'), L('Saldırı', 'Attack'), L('Savunma', 'Defense'), L('Deneyim', 'Experience')], maps.map((m) => [esc(m.name), `<strong>${esc(monsterName(m.boss.id, m.boss.name))}</strong>`, num(m.boss.hp), num(m.boss.atk), num(m.boss.def), num(m.boss.xp)]))}
    <h2>${L('Klan zindanı', 'Clan dungeon')}</h2>
    <p>${L(`Klanın <strong>${data.clanDungeon.total} aşamalı</strong> ortak zindanı. ${data.clanDungeon.mid}. aşamada gözcü, ${data.clanDungeon.final}. aşamada zindan efendisi seni bekler. Klan başına günde ${data.clanDungeon.dailyEntries} giriş vardır.`,
      `Your clan's shared <strong>${data.clanDungeon.total}-stage</strong> dungeon. A sentinel awaits at stage ${data.clanDungeon.mid} and the dungeon lord at stage ${data.clanDungeon.final}. Each clan gets ${data.clanDungeon.dailyEntries} entries a day.`)}</p>
    ${table([L('Aşama', 'Stage'), L('Can', 'Health'), L('Saldırı', 'Attack'), L('Savunma', 'Defense')], [[esc(en ? E.clanDungeon.first : data.clanDungeon.first.name), num(data.clanDungeon.first.hp), num(data.clanDungeon.first.atk), num(data.clanDungeon.first.def)], [esc(en ? E.clanDungeon.mid : data.clanDungeon.mid_.name) + ` <span class="pill">${L('Orta boss', 'Mid boss')}</span>`, num(data.clanDungeon.mid_.hp), num(data.clanDungeon.mid_.atk), num(data.clanDungeon.mid_.def)], [esc(en ? E.clanDungeon.last : data.clanDungeon.last.name) + ` <span class="pill">Final</span>`, num(data.clanDungeon.last.hp), num(data.clanDungeon.last.atk), num(data.clanDungeon.last.def)]])}
    <p>${L('Zindan <strong>klan malzemeleri</strong> düşürür:', 'The dungeon drops <strong>clan materials</strong>:')} ${data.clanDungeon.materials.map((m) => `<span class="tier" style="--c:${m.color}">${esc(en ? E.clanMaterials[m.key] || m.name : m.name)}</span>`).join(' ')}. ${L('Bunlar klan binasını ve depoyu geliştirmek için kullanılır.', 'They are used to upgrade the clan building and vault.')}</p>
    <h2>${L("Klan boss'u", 'Clan boss')}</h2>
    <p>${L("Klan binasının seviyesi ve klanın biriktirdiği NP (ulusal puan) yettiğinde lider, memur ya da yardımcısı klan boss'unu açar. Boss bir saatlik pencerede tüm üyelerin ortak vuruşlarıyla yenilir.",
      "When the clan building level and the clan's accumulated NP (national points) are high enough, the leader, an officer or the deputy can open the clan boss. The boss is defeated within a one-hour window by the combined hits of all members.")}</p>
    ${table(['Boss', L('Bina seviyesi', 'Building level'), L('Gereken NP', 'NP required'), L('Can', 'Health')], data.clan.bossStages.map((b) => [`<strong style="color:${b.color}">${esc(en ? E.clanBoss[b.id] || b.name : b.name)}</strong>`, b.buildingLevelRequired, num(b.npRequired), num(b.hp)]))}
  `);

  // ---------------- Silahlar
  const weaponRow = (w) => [
    w.image ? `<img class="icon" src="${imgSrc(w.image, A)}" alt="" loading="lazy">` : '', `<strong>${esc(weaponName(w))}</strong><br><small class="muted">${esc(weaponLore(w))}</small>`,
    chip(w.tier), w.levelMin ? `${w.levelMin}–${w.levelMax}` : '—', typeLabel(w.weaponType), w.element ? esc(ELEMENT[lang][w.element] || w.element) : '—', w.atk ? num(w.atk) : '—'];
  const origRow = (w) => [w.image ? `<img class="icon" src="${imgSrc(w.image, A)}" alt="" loading="lazy">` : '', `<strong>${esc(weaponName(w))}</strong><br><small class="muted">${esc(weaponLore(w))}</small>`, chip(w.tier), '—', typeLabel(w.weaponType), w.element ? esc(ELEMENT[lang][w.element] || w.element) : '—', '—'];
  wiki('silahlar', L('Wiki · Silahlar', 'Wiki · Weapons'), L('Her sınıfın silahları: seviye aralığı, tür, element ve saldırı değeri.', "Every class's weapons: level range, type, element and attack value."), `
    <h1>${L('Silahlar', 'Weapons')}</h1>
    <p class="lead">${L('Silahlar 6 kalitede gelir. Kalite arttıkça silah güçlenir ve daha yüksek seviye ister. Aşağıdaki saldırı değeri <strong>+0</strong> hâlidir; geliştirdikçe artar.', 'Weapons come in 6 qualities. The higher the quality, the stronger the weapon and the higher the level it needs. The attack value below is the <strong>+0</strong> state; it grows as you upgrade.')}</p>
    <div class="chips">${[1, 2, 3, 4, 5, 6].map((t) => chip(t)).join('')}</div>
    ${['warrior', 'rogue', 'mage'].map((cls) => `
      <h2 id="${cls}">${esc(CLASS_NAME[lang][cls])} ${L('silahları', 'weapons')}</h2>
      ${table(['', L('Silah', 'Weapon'), L('Kalite', 'Quality'), L('Seviye', 'Level'), L('Tür', 'Type'), 'Element', L('Saldırı (+0)', 'Attack (+0)')], [...weaponsOf(cls).map(weaponRow), ...data.originals.filter((w) => w.cls === cls).sort((a, b) => a.tier - b.tier).map(origRow)], 'items')}`).join('')}
  `);

  // ---------------- Zırhlar
  const armorFor = (cls) => {
    const slots = ['head', 'chest', 'legs', 'gauntlets', 'boots'];
    const rows = [1, 2, 3, 4, 5].map((tier) => {
      const parts = slots.map((s) => data.armor.find((a) => a.cls === cls && a.slot === s && a.tier === tier));
      const first = parts.find(Boolean);
      return [chip(tier), first ? `${first.levelMin}–${first.levelMax}` : '—', ...parts.map((p) => (p ? `${esc(p.name)}<br><small class="muted">${L('Savunma', 'Defense')} ${p.def}</small>` : '—'))];
    });
    return table([L('Kalite', 'Quality'), L('Seviye', 'Level'), SLOT_LABEL[lang].head, SLOT_LABEL[lang].chest, en ? 'Leggings' : 'Don', SLOT_LABEL[lang].gauntlets, SLOT_LABEL[lang].boots], rows, 'armor');
  };
  wiki('zirhlar', L('Wiki · Zırhlar ve takılar', 'Wiki · Armor and accessories'), L('Zırh parçaları, kaliteleri ve takı aileleri.', 'Armor pieces, qualities and accessory families.'), `
    <h1>${L('Zırhlar ve takılar', 'Armor and accessories')}</h1>
    <p class="lead">${L('Her sınıfın 5 parçalık (kask, göğüslük, don, eldiven, bot) 5 kalitelik zırh serisi vardır. Parçaları birlikte giymek set bonusu verir.', "Every class has a 5-piece armor series (helm, chestplate, leggings, gauntlets, boots) in 5 qualities. Wearing the pieces together gives a set bonus.")}</p>
    ${['warrior', 'rogue', 'mage'].map((cls) => `<h2>${esc(CLASS_NAME[lang][cls])} ${L('zırhları', 'armor')}</h2>${armorFor(cls)}`).join('')}
    <h2>${L('Takılar', 'Accessories')}</h2>
    <p>${L('Küpe, kolye, yüzük ve kemer; savunma, can ve statü bonusu verir. Takılar ailelerine göre kalite kazanır ve geliştirilebilir.', 'Earrings, necklaces, rings and belts give defense, health and stat bonuses. Accessories gain quality by family and can be upgraded.')}</p>
    ${Object.entries(data.accessories).map(([slot, list]) => `<h3>${SLOT_LABEL[lang][slot] || esc(slot)}</h3>${table([L('Takı', 'Accessory'), L('Kalite', 'Quality'), L('Savunma', 'Defense'), L('Can', 'Health'), 'Mana', L('Statü', 'Stats')], list.map((a) => [`<strong>${esc(en ? a.nameEn || a.name : a.name)}</strong>`, chip(a.tier), a.def ?? 0, a.hp ?? 0, a.mp ?? 0, Object.entries(a.statBonus || {}).map(([k, v]) => `${STAT_SHORT[k] || k} +${v}`).join(' ') || '—']))}`).join('')}
  `);

  // ---------------- Geliştirme (kasıtlı olarak oranlar yok)
  wiki('gelistirme', L('Wiki · Eşya geliştirme', 'Wiki · Item upgrading'), L('Yükseltme parşömenleri, bonus parşömen ve geliştirme riski nasıl çalışır.', 'How upgrade scrolls, the bonus scroll and upgrade risk work.'), `
    <h1>${L('Eşya geliştirme', 'Item upgrading')}</h1>
    <p class="lead">${L('Silah, zırh ve takılar <strong>Yükselt</strong> ekranında yükseltme parşömeniyle geliştirilir. Eşyanın kalitesine uygun parşömen gerekir ve parşömenin altın fiyatı kaliteyle artar.', 'Weapons, armor and accessories are upgraded on the <strong>Upgrade</strong> screen with an upgrade scroll. You need a scroll that matches the item\'s quality, and the scroll\'s gold price rises with quality.')}</p>
    <div class="callout warn">${L('<strong>Risk:</strong> Geliştirme bir şans işidir. Eşya seviyesi yükseldikçe başarı şansı düşer ve başarısız denemede eşya ile parşömen kaybolabilir. Oyun, denemeden önce seni uyarır; riski bilerek yükselt.', '<strong>Risk:</strong> Upgrading is a game of chance. The success chance drops as the item level rises, and a failed attempt can destroy the item and the scroll. The game warns you before each attempt; upgrade knowing the risk.')}</div>
    <h2>${L('Bonus parşömen', 'Bonus scroll')}</h2>
    <p>${L(`Normal parşömenin yanına <strong>Bonus Parşömen</strong> koyarsan başarı şansı artar; özellikle yüksek seviyelerde fark yaratır. Bonus parşömen elmasla alınır (${num(data.prices.bonusScroll)} elmas).`, `If you add a <strong>Bonus Scroll</strong> next to a normal scroll, the success chance increases; it matters most at high levels. The bonus scroll is bought with diamonds (${num(data.prices.bonusScroll)} diamonds).`)}</p>
    <h2>${L('İpuçları', 'Tips')}</h2>
    <ul>
      <li>${L('Önemli eşyanı yükseltmeden önce yedeğini hazırla; ilk seviyeler daha güvenlidir.', 'Prepare a backup before upgrading an important item; the first levels are safer.')}</li>
      <li>${L('Bonus parşömeni en riskli denemeler için sakla.', 'Save the bonus scroll for the riskiest attempts.')}</li>
      <li>${L('Geliştirme seviyesi eşyanın saldırı/savunma değerlerini ve statü bonusunu artırır; görünümü de değişir.', "The upgrade level raises the item's attack/defense and stat bonus; its appearance changes too.")}</li>
    </ul>
  `);

  // ---------------- Klan
  const perm = data.clan.defaultPermissions;
  const permLabel = { tr: { deposit: 'Depoya eşya koyma', withdraw: 'Depodan eşya alma', invite: 'Üye davet etme', kick: 'Üye atma', upgrade: 'Bina geliştirme', donate: 'Bağış', dungeon: 'Klan zindanı' }, en: { deposit: 'Deposit items', withdraw: 'Withdraw items', invite: 'Invite members', kick: 'Kick members', upgrade: 'Upgrade the building', donate: 'Donate', dungeon: 'Clan dungeon' } };
  wiki('klan', L('Wiki · Klanlar', 'Wiki · Clans'), L('Klan rütbeleri, yetkiler, depo, bina ve klan puanı.', 'Clan ranks, permissions, vault, building and clan points.'), `
    <h1>${L('Klanlar', 'Clans')}</h1>
    <p class="lead">${L(`Klan, en fazla <strong>${data.clan.maxMembers} oyuncu</strong>luk topluluktur. Kurmak ${num(data.clan.foundCost)} elmas. Klanla ortak zindan, ortak depo ve klan boss'u açılır; aktif üye sayısına göre klan deneyim bonusu kazanırsın.`, `A clan is a community of up to <strong>${data.clan.maxMembers} players</strong>. Founding one costs ${num(data.clan.foundCost)} diamonds. With a clan you unlock the shared dungeon, shared vault and clan boss, and you earn a clan experience bonus based on active members.`)}</p>
    <h2>${L('Rütbeler', 'Ranks')}</h2>
    ${table([L('Rütbe', 'Rank'), L('Sınır', 'Limit'), L('Yapabildikleri', 'Abilities')], [
      [`<strong>${L('Lider', 'Leader')}</strong>`, '1', L('Her şey; rütbeleri ve depo yetkilerini belirler.', 'Everything; sets ranks and vault permissions.')],
      [`<strong>${L('Lider Yardımcısı', 'Deputy')}</strong>`, L(`en fazla ${data.clan.maxDeputies}`, `up to ${data.clan.maxDeputies}`), L("Memur ve üyeleri yönetir, klan boss'unu açabilir.", 'Manages officers and members, can open the clan boss.')],
      [`<strong>${L('Memur', 'Officer')}</strong>`, L(`en fazla ${data.clan.maxOfficers}`, `up to ${data.clan.maxOfficers}`), L("Davet eder, üye atar (kendinden düşük rütbeyi), klan boss'unu açabilir.", 'Invites, kicks members of a lower rank, can open the clan boss.')],
      [`<strong>${L('Normal Üye', 'Member')}</strong>`, '—', L('Klan zindanına katılır, bağış yapar, depoya eşya koyar.', 'Joins the clan dungeon, donates, deposits items.')],
    ])}
    <p class="muted">${L('Rütbe değişimi kademelidir: Normal Üye ↔ Memur ↔ Lider Yardımcısı. Lider ayrılırsa liderlik sırayla yardımcıya, memura, sonra en eski üyeye geçer.', 'Rank changes are step by step: Member ↔ Officer ↔ Deputy. If the leader leaves, leadership passes to the deputy, then an officer, then the longest-standing member.')}</p>
    <h2>${L('Ortak depo ve yetkiler', 'Shared vault and permissions')}</h2>
    <p>${L(`Depo ${data.clan.vault} eşya alır. Lider, hangi rütbenin neyi yapabileceğini ayarlar. Varsayılan yetkiler:`, `The vault holds ${data.clan.vault} items. The leader sets what each rank can do. Default permissions:`)}</p>
    ${table([L('Yetki', 'Permission'), L('Yardımcı', 'Deputy'), L('Memur', 'Officer'), L('Üye', 'Member')], data.clan.permissions.map((p) => [esc(permLabel[lang][p] || p), perm.deputy[p] ? '✔' : '—', perm.officer[p] ? '✔' : '—', perm.member[p] ? '✔' : '—']))}
    <h2>${L('Klan binası', 'Clan building')}</h2>
    <p>${L(`Klan binası ${data.clan.buildingMax} seviyeye kadar geliştirilir; her seviye yeni klan boss'unun kilidini açar. Gerekli altın ve elmas klan hazinesinden ödenir.`, `The clan building can be upgraded up to level ${data.clan.buildingMax}; each level unlocks a new clan boss. The gold and diamonds required are paid from the clan treasury.`)}</p>
    ${table([L('Seviye', 'Level'), L('Altın', 'Gold'), L('Elmas', 'Diamonds')], Object.entries(data.clan.buildingCost).map(([lvl, c]) => [lvl, num(c.gold), num(c.diamonds)]))}
    <h2>${L('Klan deneyim bonusu', 'Clan experience bonus')}</h2>
    ${table([L('Üye sayısı', 'Members'), L('Deneyim bonusu', 'Experience bonus')], data.clan.expTiers.slice().reverse().map((t) => [`${t.min}+`, L(`%${Math.round(t.bonus * 100)}`, `${Math.round(t.bonus * 100)}%`)]))}
  `);

  // ---------------- Savaş alanı
  const wz = data.warzone;
  wiki('savas-alani', L('Wiki · Savaş alanı', 'Wiki · Warzone'), L('Savaş alanı bosslarının programı, canavar avı ve haftalık sıralama ödülleri.', 'The Warzone boss schedule, monster hunt and weekly ranking rewards.'), `
    <h1>${L('Savaş alanı', 'Warzone')}</h1>
    <p class="lead">${L(`Savaş alanı, <strong>${wz.unlockLevel}. seviyeden</strong> sonra açılır. Ortak bosslar, güçlendirilmiş canavar avı ve haftalık sıralama burada.`, `The Warzone opens at <strong>level ${wz.unlockLevel}</strong>. Shared bosses, an empowered monster hunt and the weekly ranking are here.`)}</p>
    <ul>
      <li>${L(`<strong>Işınlanma:</strong> ${num(wz.teleportCost)} altın.`, `<strong>Teleport:</strong> ${num(wz.teleportCost)} gold.`)}</li>
      <li>${L(`<strong>Dünya boss'ları:</strong> yaklaşık her ${wz.bossSlotHours} saatte bir ortaya çıkar. Toplanma süresinden sonra herkes ${wz.fightWindowMin} dakika boyunca vurur; toplam hasarına göre ödül alırsın.`, `<strong>World bosses:</strong> appear roughly every ${wz.bossSlotHours} hours. After the gathering time everyone attacks for ${wz.fightWindowMin} minutes; you are rewarded by your total damage.`)}</li>
      <li>${L(`<strong>Canavar avı:</strong> canavarlar ${wz.huntPower}× güçlüdür, ödül altını ${wz.huntGold}×, eşya/sandık şansı ${wz.huntDrop}× artar.`, `<strong>Monster hunt:</strong> monsters are ${wz.huntPower}× stronger, reward gold is ${wz.huntGold}×, and the item/chest chance is ${wz.huntDrop}×.`)}</li>
      <li>${L(`<strong>Haftalık sıralama:</strong> ilk 3 oyuncu elmas kazanır: ${data.weeklyRank.map((v, i) => `${i + 1}. ${num(v)}`).join(', ')}. Sıralama her hafta sıfırlanır.`, `<strong>Weekly ranking:</strong> the top 3 players win diamonds: ${data.weeklyRank.map((v, i) => `#${i + 1} ${num(v)}`).join(', ')}. The ranking resets every week.`)}</li>
    </ul>
    <h2>${L("Savaş alanı boss'ları", 'Warzone bosses')}</h2>
    ${table(['Boss', L('Can', 'Health'), L('Saldırı', 'Attack'), L('Savunma', 'Defense')], wz.bosses.map((b) => [`<strong style="color:${b.color}">${esc(monsterName(b.id, b.name))}</strong>`, num(b.hp), num(b.atk), num(b.def)]))}
  `);

  // ---------------- Ekonomi
  const potionRows = (kind, label) => data.potions[kind].map((amount, i) => [esc((en ? E.potions : data.potions.names)[kind][i]), `${num(amount)} ${label}`, `${num(data.potions.prices[kind][i])} ${L('altın', 'gold')}`]);
  wiki('ekonomi', L('Wiki · Ekonomi ve elmas', 'Wiki · Economy and diamonds'), L('Altın, elmas, iksirler, pazar, premium üyelik ve günlük ödüller.', 'Gold, diamonds, potions, the market, premium and daily rewards.'), `
    <h1>${L('Ekonomi ve elmas', 'Economy and diamonds')}</h1>
    <h2>${L('Altın ve elmas', 'Gold and diamonds')}</h2>
    <p>${L('<strong>Altın</strong> oyun içinde kazanılır: avlanarak, görevlerle, eşya satarak. <strong>Elmas</strong> özel para birimidir; günlük giriş, haftalık sıralama ve reklam izleyerek kazanılır; mağaza satın alımı açıldığında Apple/Google üzerinden de alınabilir (elmaslar sunucuda doğrulanarak hesabına yazılır).', '<strong>Gold</strong> is earned in the game: by hunting, quests and selling items. <strong>Diamonds</strong> are the premium currency; they are earned from the daily login, the weekly ranking and by watching ads, and can be bought through Apple/Google once store purchases open (diamonds are verified on the server and added to your account).')}</p>
    <h2>${L('İksirlar', 'Potions')}</h2>
    ${table([L('İksir', 'Potion'), L('Etki', 'Effect'), L('Fiyat', 'Price')], [...potionRows('hp', L('can', 'health')), ...potionRows('mp', 'mana')])}
    <h2>${L('Pazar', 'Market')}</h2>
    <p>${L(`Eşyalarını oyuncu pazarında tezgâha koyarak diğer oyunculara satabilirsin. Tezgâh en fazla ${data.market.maxItems} eşya alır; süre seçilir ve süreye göre altın ücreti vardır.`, `You can sell your items to other players by placing them on a stall in the player market. A stall holds up to ${data.market.maxItems} items; you choose a duration and pay a gold fee based on it.`)}</p>
    ${table([L('Süre', 'Duration'), L('Tezgâh ücreti', 'Stall fee')], data.market.hours.map((h) => [L(`${h} saat`, `${h} ${h === 1 ? 'hour' : 'hours'}`), `${num(data.market.fee[h])} ${L('altın', 'gold')}`]))}
    <h2>${L('Günlük ve haftalık ödüller', 'Daily and weekly rewards')}</h2>
    ${table([L('Gün', 'Day'), L('Altın', 'Gold'), L('Elmas', 'Diamonds'), L('Diğer', 'Other')], data.daily.login.map((d) => [d.day, num(d.gold), d.diamonds || '—', [d.scrollCount ? L(`${d.scrollCount} parşömen`, `${d.scrollCount} scrolls`) : '', d.chestTier ? L('Sandık', 'Chest') : '', d.bonusScroll ? L('Bonus parşömen', 'Bonus scroll') : ''].filter(Boolean).join(', ') || '—']))}
    <p class="muted">${L('Giriş serisi 7 gün sürer; günde bir kez alınır.', 'The login streak lasts 7 days and can be claimed once a day.')}</p>
    ${table([L('Günlük görev hedefi', 'Daily quest target'), L('Altın', 'Gold'), L('Deneyim', 'Experience'), L('Sandık', 'Chest')], data.daily.quests.map((q) => [L(`${q.target} canavar`, `${q.target} monsters`), num(q.goldReward), num(q.xpReward), q.chest ? '✔' : '—']))}
    ${table([L('Haftalık görev', 'Weekly quest'), L('Hedef', 'Target'), L('Altın', 'Gold'), L('Deneyim', 'Experience'), L('Sandık', 'Chest')], data.weekly.map((q) => [`<strong>${esc(en ? E.weekly[q.id]?.name || q.name : q.name)}</strong><br><small class="muted">${esc(en ? E.weekly[q.id]?.desc || q.desc : q.desc)}</small>`, q.target, num(q.goldReward), num(q.xpReward), q.chest ? '✔' : '—']))}
    <h2>${L('Zamanlı etkinlikler', 'Scheduled events')}</h2>
    ${data.events.map((e) => `<p>${L(`<strong>${esc(e.name)}</strong>: her gün ${String(e.hour).padStart(2, '0')}:${String(e.minute).padStart(2, '0')}, ${e.durationMinutes} dakika; etkinlik boyunca deneyim bonusu birikir.`, `<strong>${esc(E.events[e.id] || e.name)}</strong>: every day at ${String(e.hour).padStart(2, '0')}:${String(e.minute).padStart(2, '0')} for ${e.durationMinutes} minutes; an experience bonus builds up during the event.`)}</p>`).join('')}
    <h2>${L('Premium üyelik', 'Premium')}</h2>
    <p>${L(`Premium, ${data.premiumDays} gün sürer ve savaş otomatik oynama dahil avantaj verir. Mağazadan aldığın premium bir <strong>kupon</strong> olarak envantere gelir; istediğin zaman envanterinden ya da deponda kullanarak başlatırsın. Mağazadan alınan 15 günlük kuponlar pazarda satılabilir. Çarktan ve topluluk ödüllerinden gelen kısa süreli kuponlar takas edilemez.`,
      `Premium lasts ${data.premiumDays} days and gives advantages including auto-battle. Premium bought in the store arrives as a <strong>voucher</strong> in your inventory; use it from your inventory or bank whenever you like to start it. The 15-day vouchers bought in the store can be sold on the market. Short vouchers from the wheel and community rewards cannot be traded.`)}</p>
    ${table(['', 'Apex Premium', 'Mythic Premium'], [
      [L('Elmas fiyatı', 'Diamond price'), num(data.premium.apex.price), num(data.premium.mythic.price)],
      [L('Deneyim', 'Experience'), `×${data.premium.apex.expMult}`, `×${data.premium.mythic.expMult}`],
      [L('Altın', 'Gold'), `×${data.premium.apex.goldMult}`, `×${data.premium.mythic.goldMult}`],
      [L('Eşya düşürme', 'Item drops'), `×${data.premium.apex.dropMult}`, `×${data.premium.mythic.dropMult}`],
      [L('Satış geliri', 'Sell income'), `×${data.premium.apex.sellMult}`, `×${data.premium.mythic.sellMult}`],
      [L('Tamir indirimi', 'Repair discount'), L(`%${Math.round(data.premium.apex.repairDiscount * 100)}`, `${Math.round(data.premium.apex.repairDiscount * 100)}%`), L(`%${Math.round(data.premium.mythic.repairDiscount * 100)}`, `${Math.round(data.premium.mythic.repairDiscount * 100)}%`)],
      [L('Ekstra depo sayfası', 'Extra bank pages'), data.premium.apex.bankBonusPages || '—', data.premium.mythic.bankBonusPages || '—'],
    ])}
    <h2>${L('Kanatlar ve takviyeler', 'Wings and boosts')}</h2>
    <p>${L(`Kanatlar görünüm ve küçük bonuslar verir (${data.wings.length} model, her biri ${num(data.wings[0]?.price)} elmas):`, `Wings give a look and small bonuses (${data.wings.length} models, ${num(data.wings[0]?.price)} diamonds each):`)} ${data.wings.map((w) => `<span class="pill" style="--c:${w.color}">${esc(en ? w.nameEn || w.name : w.name)}</span>`).join(' ')}</p>
    <p>${L(`Takviye parşömenleri ${data.boosts.minutes} dakika boyunca etki eder; ${data.boosts.pack}'lik paketlerle alınır.`, `Boost scrolls last ${data.boosts.minutes} minutes and are bought in packs of ${data.boosts.pack}.`)}</p>
    <h2>${L('Hesap ve ücretsiz elmas', 'Account and free diamonds')}</h2>
    <p>${L(`Başlangıçta ${data.characterSlots - 1} karakter yuvan vardır; 3. yuva ${num(data.prices.slotUnlock)} elmas.`, `You start with ${data.characterSlots - 1} character slots; the 3rd slot costs ${num(data.prices.slotUnlock)} diamonds.`)}</p>
  `);

  // ---------------- SSS
  const faq = [
    [L('Oyun ücretsiz mi?', 'Is the game free?'), L('Evet, Nyxia Online ücretsiz indirilir. İstersen elmas satın alabilirsin; oyunun tamamı elmas almadan da oynanır.', 'Yes, Nyxia Online is free to download. You can buy diamonds if you like; the whole game can be played without buying any.')],
    [L('Hesabımı başka telefonda açabilir miyim?', 'Can I use my account on another phone?'), L('Evet. İlerlemen sunucuda saklanır. Hesap aynı anda tek yerde açık olabilir: başka cihazda giriş yaparsan oradaki oturum kapanır, hiçbir şey kaybolmaz.', 'Yes. Your progress is stored on the server. An account can be open in one place at a time: if you sign in on another device, the other session is closed and nothing is lost.')],
    [L('Şifremi unuttum, ne yapmalıyım?', 'I forgot my password. What should I do?'), L('Hesabına doğrulanmış bir e-posta eklediysen (Ayarlar → Hesap), giriş ekranındaki "Şifremi unuttum" ile e-postana kod gelir ve şifreni yenilersin. E-postan yoksa Destek sayfasından talep aç.', 'If you added a verified email to your account (Settings → Account), use "Forgot password" on the sign-in screen: a code is sent to your email and you set a new password. If you have no email on the account, open a request on the Support page.')],
    [L('Hile yapılabiliyor mu?', 'Is cheating possible?'), L('Savaşlar, ödüller ve ekonomi sunucuda hesaplanır ve hileye karşı korunur. Hile ve kötüye kullanım hesabın engellenmesine yol açar.', 'Battles, rewards and the economy are calculated on the server and protected against cheating. Cheating and abuse lead to your account being blocked.')],
    [L('Bir oyuncuyu nasıl şikayet ederim?', 'How do I report a player?'), L('Oyun içinde sohbette ya da profilde şikayet düğmesini kullan; ayrıca Destek sayfasından da bildirebilirsin. Şikayetler incelenir.', 'Use the report button in chat or on the profile in the game; you can also report on the Support page. Reports are reviewed.')],
    [L('Hesabımı nasıl silerim?', 'How do I delete my account?'), L('Oyunda Ayarlar → Hesap → Hesabımı sil. Oyuna giremiyorsan Hesap Silme sayfasındaki adımlarla bize yaz.', 'In the game: Settings → Account → Delete my account. If you cannot get into the game, write to us using the steps on the Delete Account page.')],
    [L('Satın aldığım elmas gelmedi.', 'The diamonds I bought did not arrive.'), L('Mağaza satın alımları sunucuda doğrulanır; birkaç dakika sürebilir. Gelmezse Destek sayfasından "Ödeme" kategorisiyle talep aç, makbuz numaranı ekle.', 'Store purchases are verified on the server and can take a few minutes. If they do not arrive, open a request on the Support page with the "Payment" category and add your receipt number.')],
    [L('Eşyam kayboldu / hata gördüm.', 'My item vanished / I found a bug.'), L('Destek sayfasından "Hata" kategorisiyle talep aç; ne olduğunu, saati ve karakter adını yaz.', 'Open a request on the Support page with the "Bug" category; describe what happened, the time and your character name.')],
  ];
  wiki('sss', L('Wiki · Sık sorulan sorular', 'Wiki · FAQ'), L('Hesap, ödeme, hile ve destek hakkında sık sorulan sorular.', 'Frequently asked questions about accounts, payments, cheating and support.'), `
    <h1>${L('Sık sorulan sorular', 'Frequently asked questions')}</h1>
    ${faq.map(([q, a]) => `<details class="faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}
    <div class="callout">${L('Aradığını bulamadın mı?', "Didn't find what you were looking for?")} <a href="${R}support.html">${L('Destek talebi aç', 'Open a support request')}</a>.</div>
  `);

  return pages;
}

export const imgSrc = (path, base = '../') => `${base}img/items/${imgKey(path)}.${/\.svg$/i.test(path) ? 'svg' : 'webp'}`;
export const imgKey = (path) => String(path).split('/').pop().replace(/\.[a-z0-9]+$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
