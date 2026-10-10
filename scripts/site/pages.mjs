import { esc, num, page, tierChip, table, WIKI_PAGES } from './layout.mjs';

const ELEMENT = { flame: 'Alev', glacier: 'Buz', lightning: 'Yıldırım', poison: 'Zehir', holy: 'Kutsal', dark: 'Karanlık' };
const SLOT_LABEL = { head: 'Kask', chest: 'Göğüslük', legs: 'Don/Bacaklık', gauntlets: 'Eldiven', boots: 'Bot', earring: 'Küpe', necklace: 'Kolye', ring: 'Yüzük', belt: 'Kemer' };
const CLASS_TR = { warrior: 'Warrior', rogue: 'Rogue (Okçu)', mage: 'Mage' };
const CLASS_BLURB = {
  warrior: 'Ön safın sağlam savaşçısı. Yüksek can ve savunmayla boss karşılaşmalarında ekibi taşır.',
  rogue: 'Menzilli okçu. Hızlı atışlar ve yüksek kritik şansıyla hasarı uzaktan, hızla verir.',
  mage: 'Yıkıcı büyüleriyle en yüksek hasarı verir ama canı düşüktür; mana yönetimi her şeydir.',
};
const STAT_SHORT = { str: 'STR', sta: 'STA', dex: 'DEX', int: 'INT', mag: 'MPW' };

function effectText(effect) {
  if (!effect) return '';
  const pct = (v) => `%${Math.round(v * 100)}`;
  switch (effect.type) {
    case 'damage': return `${effect.mult}× hasar`;
    case 'heal': return `Canın ${pct(effect.pct)} kadarını yeniler`;
    case 'buffAtk': return `Saldırıyı ${effect.mult}× artırır (${effect.turns} tur)`;
    case 'dot': return `${effect.turns} tur boyunca süren hasar (${effect.mult}×)`;
    case 'execute': return `Hedefin canı ${pct(effect.hpPctThreshold)} altındaysa ${effect.mult}× hasar`;
    default: return effect.type;
  }
}

export function buildPages(data) {
  const pages = {};
  const wiki = (slug, title, description, body) => { pages[`wiki/${slug === 'index' ? 'index' : slug}.html`] = page({ title, description, root: '../', body, active: 'wiki', wikiActive: slug }); };
  const maps = data.maps;
  const weaponsOf = (cls) => data.weapons.filter((w) => w.cls === cls).sort((a, b) => a.tier - b.tier || a.levelMin - b.levelMin);

  // ---------------- Wiki: başlangıç
  wiki('index', 'Wiki · Başlangıç rehberi', 'Nyxia Online oyun rehberi: sınıflar, bölgeler, silahlar, klanlar ve daha fazlası.', `
    <h1>Nyxia Online Wiki</h1>
    <p class="lead">Nyxia Online bir mobil online RPG. Üç sınıftan biriyle başlar, ${maps.length} bölgeyi aşar, klanınla boss'ları devirir ve savaş alanında sıralamaya girersin. Bu wiki, oyunun kendi verisinden otomatik üretilir; sayılar oyunla birebir aynıdır.</p>
    <div class="callout"><strong>Tek cümleyle:</strong> avlan, seviye atla, eşyalarını geliştir, klanla güçlen. Hesabın sunucuda saklanır; telefonunu değiştirsen de kaldığın yerden devam edersin.</div>
    <h2>Hızlı başlangıç</h2>
    <ol class="steps">
      <li><strong>Irkını ve sınıfını seç.</strong> İnsan veya Ork; Warrior, Rogue ya da Mage. Hesaptaki ırk tüm karakterlerin için aynıdır.</li>
      <li><strong>Fallow Valley'de avlan.</strong> Canavarları yen, deneyim ve altın kazan. Her seviyede <strong>${data.stats.pointsPerLevel} statü puanı</strong> kazanırsın (en çok ${data.stats.cap} puana kadar).</li>
      <li><strong>Eşya düşür, kuşan.</strong> Silah, zırh ve takı bul; seviye ve statü şartını karşılayanı giy.</li>
      <li><strong>Günlük görevleri yap.</strong> Günlük giriş ödülü, günlük/haftalık görevler ve günlük zindan hakkın her gün yenilenir.</li>
      <li><strong>Klana katıl.</strong> Klan zindanı, ortak depo ve klan boss'u tek başına ulaşamayacağın ödüller verir.</li>
    </ol>
    <h2>Wiki bölümleri</h2>
    <div class="cards">${WIKI_PAGES.filter(([s]) => s !== 'index').map(([slug, label]) => `<a class="card link" href="${slug}.html"><h3>${esc(label)}</h3></a>`).join('')}</div>
  `);

  // ---------------- Sınıflar
  const classCard = (c) => `
    <section class="class" id="${c.id}" style="--c:${c.color}">
      <div class="class-head">
        <img src="../img/chars/${c.id}-human.webp" alt="${esc(c.name)} İnsan" loading="lazy">
        <img src="../img/chars/${c.id}-orc.webp" alt="${esc(c.name)} Ork" loading="lazy">
        <div><h2>${esc(CLASS_TR[c.id] || c.name)}</h2><p>${esc(CLASS_BLURB[c.id] || c.desc)}</p></div>
      </div>
      ${table(['Özellik', 'Başlangıç değeri'], [
        ['Saldırı', c.atk], ['Savunma', c.def], ['Can', c.maxHp], ['Mana', c.maxMp], ['Kritik şansı', `%${Math.round(c.crit * 100)}`],
        ['Ana statü', esc(data.stats.labels[c.mainStat] || c.mainStat)],
        ['Başlangıç statüleri', Object.entries(c.baseStats).map(([k, v]) => `${STAT_SHORT[k]} ${v}`).join(' · ')],
      ])}
      <h3>Yetenekler</h3>
      <p class="muted">Aynı anda en fazla ${data.loadoutSlots} yetenek kuşanabilirsin. Gelişmiş yetenekler altın ve görev ister.</p>
      ${table(['Yetenek', 'Seviye', 'Mana', 'Bekleme', 'Etki', 'Altın'], data.skills[c.id].map((s) => [`<strong>${esc(s.name)}</strong>`, s.unlockLevel, s.mpCost, s.cooldown ? `${s.cooldown} tur` : '—', esc(effectText(s.effect)), s.goldCost ? num(s.goldCost) : '—']))}
    </section>`;
  wiki('siniflar', 'Wiki · Sınıflar ve yetenekler', 'Warrior, Rogue ve Mage: başlangıç değerleri ve tüm yetenekler.', `
    <h1>Sınıflar ve yetenekler</h1>
    <p class="lead">Üç sınıf, iki ırk. Irk görünümü değiştirir; sınıf oynanışını belirler.</p>
    <div class="cards two">${data.races.map((r) => `<div class="card" style="--c:${r.color}"><h3>${esc(r.name)}</h3><p>${esc(r.desc)}</p></div>`).join('')}</div>
    ${data.classes.map(classCard).join('')}
  `);

  // ---------------- Bölgeler
  const regionBlock = (m) => `
    <section class="region" id="${m.id}" style="--c:${m.color}">
      <div class="region-art" style="background-image:url(../img/regions/${m.id}.webp)"><div><h2>${esc(m.name)}</h2><span class="pill">Seviye ${m.levelMin}–${m.levelMax}</span></div></div>
      ${table(['Canavar', 'Can', 'Saldırı', 'Savunma', 'Deneyim'], m.monsters.map((x) => [`<strong>${esc(x.name)}</strong>`, num(x.hp), num(x.atk), num(x.def), num(x.xp)]))}
      <p class="muted"><strong>Harita sonu boss'u:</strong> ${esc(m.boss.name)}. Can ${num(m.boss.hp)}, saldırı ${num(m.boss.atk)}, savunma ${num(m.boss.def)}. Günde bir kez yenilebilir ve garantili sandık verir.</p>
      <img class="bestiary" src="../img/bestiary/${m.id}.webp" alt="${esc(m.name)} canavarları" loading="lazy">
    </section>`;
  wiki('bolgeler', 'Wiki · Bölgeler ve canavarlar', 'Nyxia Online haritaları, seviye aralıkları ve canavar istatistikleri.', `
    <h1>Bölgeler ve canavarlar</h1>
    <p class="lead">${maps.length} bölge seviyene göre açılır. Bölgedeki canavarların çoğunu yenince harita sonu boss'u kilidi açılır.</p>
    <div class="chips">${maps.map((m) => `<a href="#${m.id}" style="--c:${m.color}">${esc(m.name)} <small>${m.levelMin}–${m.levelMax}</small></a>`).join('')}</div>
    ${maps.map(regionBlock).join('')}
    <p class="muted">Bir bölgeden başkasına geçmek için kapı kullanılır; ışınlanma altın ister.</p>
  `);

  // ---------------- Zindanlar
  const soloSample = maps[0].dungeon;
  wiki('zindanlar', 'Wiki · Zindanlar ve bosslar', 'Günlük solo zindan, harita sonu boss, klan zindanı ve klan boss rehberi.', `
    <h1>Zindanlar ve bosslar</h1>
    <h2>Günlük solo zindan</h2>
    <p>Her haritanın kendi zindanı var: ${data.solo.stages} aşama, her aşama bir öncekinden güçlü, sonunda zindan efendisi. Günde <strong>${data.solo.dailyLimit} giriş hakkın</strong> var, yeni hak ${num(data.solo.extraCost)} elmasa alınabilir. Girmeden önce oyun sana hakkını hatırlatıp onay ister.</p>
    ${table(['Aşama (örnek: ' + esc(maps[0].name) + ')', 'Can', 'Saldırı', 'Savunma'], soloSample.map((s) => [esc(s.name) + (s.isBoss ? ' <span class="pill">Boss</span>' : ''), num(s.hp), num(s.atk), num(s.def)]))}
    <h2>Harita sonu boss'ları</h2>
    <p>Bölgenin canavarlarını yeterince yenince boss açılır. <strong>Günde bir kez</strong> yenilebilir; ödül olarak altın, deneyim ve garantili bir Muhafız Sandığı verir. Boss'a girmeden önce oyun onay ister, çünkü zordur.</p>
    ${table(['Bölge', 'Boss', 'Can', 'Saldırı', 'Savunma', 'Deneyim'], maps.map((m) => [esc(m.name), `<strong>${esc(m.boss.name)}</strong>`, num(m.boss.hp), num(m.boss.atk), num(m.boss.def), num(m.boss.xp)]))}
    <h2>Klan zindanı</h2>
    <p>Klanın <strong>${data.clanDungeon.total} aşamalı</strong> ortak zindanı. ${data.clanDungeon.mid}. aşamada gözcü, ${data.clanDungeon.final}. aşamada zindan efendisi seni bekler. Klan başına günde ${data.clanDungeon.dailyEntries} giriş vardır.</p>
    ${table(['Aşama', 'Can', 'Saldırı', 'Savunma'], [[esc(data.clanDungeon.first.name), num(data.clanDungeon.first.hp), num(data.clanDungeon.first.atk), num(data.clanDungeon.first.def)], [esc(data.clanDungeon.mid_.name) + ' <span class="pill">Orta boss</span>', num(data.clanDungeon.mid_.hp), num(data.clanDungeon.mid_.atk), num(data.clanDungeon.mid_.def)], [esc(data.clanDungeon.last.name) + ' <span class="pill">Final</span>', num(data.clanDungeon.last.hp), num(data.clanDungeon.last.atk), num(data.clanDungeon.last.def)]])}
    <p>Zindan <strong>klan malzemeleri</strong> düşürür: ${data.clanDungeon.materials.map((m) => `<span class="tier" style="--c:${m.color}">${esc(m.name)}</span>`).join(' ')}. Bunlar klan binasını ve depoyu geliştirmek için kullanılır.</p>
    <h2>Klan boss'u</h2>
    <p>Klan binasının seviyesi ve klanın biriktirdiği NP (ulusal puan) yettiğinde lider, memur ya da yardımcısı klan boss'unu açar. Boss bir saatlik pencerede tüm üyelerin ortak vuruşlarıyla yenilir.</p>
    ${table(['Boss', 'Bina seviyesi', 'Gereken NP', 'Can'], data.clan.bossStages.map((b) => [`<strong style="color:${b.color}">${esc(b.name)}</strong>`, b.buildingLevelRequired, num(b.npRequired), num(b.hp)]))}
  `);

  // ---------------- Silahlar
  const weaponRow = (w) => [
    w.image ? `<img class="icon" src="${imgSrc(w.image)}" alt="" loading="lazy">` : '', `<strong>${esc(w.name)}</strong><br><small class="muted">${esc(w.lore)}</small>`,
    tierChip(data, w.tier), w.levelMin ? `${w.levelMin}–${w.levelMax}` : '—', esc(data.weaponTypeLabels[w.weaponType] || w.weaponType), w.element ? esc(ELEMENT[w.element] || w.element) : '—', w.atk ? num(w.atk) : '—'];
  const origRow = (w) => [w.image ? `<img class="icon" src="${imgSrc(w.image)}" alt="" loading="lazy">` : '', `<strong>${esc(w.name)}</strong><br><small class="muted">${esc(w.lore)}</small>`, tierChip(data, w.tier), '—', esc(data.weaponTypeLabels[w.weaponType] || w.weaponType), w.element ? esc(ELEMENT[w.element] || w.element) : '—', '—'];
  wiki('silahlar', 'Wiki · Silahlar', 'Her sınıfın silahları: seviye aralığı, tür, element ve saldırı değeri.', `
    <h1>Silahlar</h1>
    <p class="lead">Silahlar 6 kalitede gelir. Kalite arttıkça silah güçlenir ve daha yüksek seviye ister. Aşağıdaki saldırı değeri <strong>+0</strong> hâlidir; geliştirdikçe artar.</p>
    <div class="chips">${[1, 2, 3, 4, 5, 6].map((t) => `<span class="tier" style="--c:${data.tiers.colors[t]}">${esc(data.tiers.labels[t])}</span>`).join('')}</div>
    ${['warrior', 'rogue', 'mage'].map((cls) => `
      <h2 id="${cls}">${esc(CLASS_TR[cls])} silahları</h2>
      ${table(['', 'Silah', 'Kalite', 'Seviye', 'Tür', 'Element', 'Saldırı (+0)'], [...weaponsOf(cls).map(weaponRow), ...data.originals.filter((w) => w.cls === cls).sort((a, b) => a.tier - b.tier).map(origRow)], 'items')}`).join('')}
  `);

  // ---------------- Zırhlar
  const armorFor = (cls) => {
    const slots = ['head', 'chest', 'legs', 'gauntlets', 'boots'];
    const rows = [1, 2, 3, 4, 5].map((tier) => {
      const parts = slots.map((s) => data.armor.find((a) => a.cls === cls && a.slot === s && a.tier === tier));
      const first = parts.find(Boolean);
      return [tierChip(data, tier), first ? `${first.levelMin}–${first.levelMax}` : '—', ...parts.map((p) => (p ? `${esc(p.name)}<br><small class="muted">Savunma ${p.def}</small>` : '—'))];
    });
    return table(['Kalite', 'Seviye', 'Kask', 'Göğüslük', 'Don', 'Eldiven', 'Bot'], rows, 'armor');
  };
  wiki('zirhlar', 'Wiki · Zırhlar ve takılar', 'Zırh parçaları, kaliteleri ve takı aileleri.', `
    <h1>Zırhlar ve takılar</h1>
    <p class="lead">Her sınıfın 5 parçalık (kask, göğüslük, don, eldiven, bot) 5 kalitelik zırh serisi vardır. Parçaları birlikte giymek set bonusu verir.</p>
    ${['warrior', 'rogue', 'mage'].map((cls) => `<h2>${esc(CLASS_TR[cls])} zırhları</h2>${armorFor(cls)}`).join('')}
    <h2>Takılar</h2>
    <p>Küpe, kolye, yüzük ve kemer; savunma, can ve statü bonusu verir. Takılar ailelerine göre kalite kazanır ve geliştirilebilir.</p>
    ${Object.entries(data.accessories).map(([slot, list]) => `<h3>${SLOT_LABEL[slot] || esc(slot)}</h3>${table(['Takı', 'Kalite', 'Savunma', 'Can', 'Mana', 'Statü'], list.map((a) => [`<strong>${esc(a.name)}</strong>`, tierChip(data, a.tier), a.def ?? 0, a.hp ?? 0, a.mp ?? 0, Object.entries(a.statBonus || {}).map(([k, v]) => `${STAT_SHORT[k] || k} +${v}`).join(' ') || '—']))}`).join('')}
  `);

  // ---------------- Geliştirme (kasıtlı olarak oranlar yok)
  wiki('gelistirme', 'Wiki · Eşya geliştirme', 'Yükseltme parşömenleri, bonus parşömen ve geliştirme riski nasıl çalışır.', `
    <h1>Eşya geliştirme</h1>
    <p class="lead">Silah, zırh ve takılar <strong>Yükselt</strong> ekranında yükseltme parşömeniyle geliştirilir. Eşyanın kalitesine uygun parşömen gerekir ve parşömenin altın fiyatı kaliteyle artar.</p>
    <div class="callout warn"><strong>Risk:</strong> Geliştirme bir şans işidir. Eşya seviyesi yükseldikçe başarı şansı düşer ve başarısız denemede eşya ile parşömen kaybolabilir. Oyun, denemeden önce seni uyarır; riski bilerek yükselt.</div>
    <h2>Bonus parşömen</h2>
    <p>Normal parşömenin yanına <strong>Bonus Parşömen</strong> koyarsan başarı şansı artar; özellikle yüksek seviyelerde fark yaratır. Bonus parşömen elmasla alınır (${num(data.prices.bonusScroll)} elmas).</p>
    <h2>İpuçları</h2>
    <ul>
      <li>Önemli eşyanı yükseltmeden önce yedeğini hazırla; ilk seviyeler daha güvenlidir.</li>
      <li>Bonus parşömeni en riskli denemeler için sakla.</li>
      <li>Geliştirme seviyesi eşyanın saldırı/savunma değerlerini ve statü bonusunu artırır; görünümü de değişir.</li>
    </ul>
  `);

  // ---------------- Klan
  const perm = data.clan.defaultPermissions;
  const permLabel = { deposit: 'Depoya eşya koyma', withdraw: 'Depodan eşya alma', invite: 'Üye davet etme', kick: 'Üye atma', upgrade: 'Bina geliştirme', donate: 'Bağış', dungeon: 'Klan zindanı' };
  wiki('klan', 'Wiki · Klanlar', 'Klan rütbeleri, yetkiler, depo, bina ve klan puanı.', `
    <h1>Klanlar</h1>
    <p class="lead">Klan, en fazla <strong>${data.clan.maxMembers} oyuncu</strong>luk topluluktur. Kurmak ${num(data.clan.foundCost)} elmas. Klanla ortak zindan, ortak depo ve klan boss'u açılır; aktif üye sayısına göre klan deneyim bonusu kazanırsın.</p>
    <h2>Rütbeler</h2>
    ${table(['Rütbe', 'Sınır', 'Yapabildikleri'], [
      ['<strong>Lider</strong>', '1', 'Her şey; rütbeleri ve depo yetkilerini belirler.'],
      ['<strong>Lider Yardımcısı</strong>', `en fazla ${data.clan.maxDeputies}`, 'Memur ve üyeleri yönetir, klan boss\'unu açabilir.'],
      ['<strong>Memur</strong>', `en fazla ${data.clan.maxOfficers}`, 'Davet eder, üye atar (kendinden düşük rütbeyi), klan boss\'unu açabilir.'],
      ['<strong>Normal Üye</strong>', '—', 'Klan zindanına katılır, bağış yapar, depoya eşya koyar.'],
    ])}
    <p class="muted">Rütbe değişimi kademelidir: Normal Üye ↔ Memur ↔ Lider Yardımcısı. Lider ayrılırsa liderlik sırayla yardımcıya, memura, sonra en eski üyeye geçer.</p>
    <h2>Ortak depo ve yetkiler</h2>
    <p>Depo ${data.clan.vault} eşya alır. Lider, hangi rütbenin neyi yapabileceğini ayarlar. Varsayılan yetkiler:</p>
    ${table(['Yetki', 'Yardımcı', 'Memur', 'Üye'], data.clan.permissions.map((p) => [esc(permLabel[p] || p), perm.deputy[p] ? '✔' : '—', perm.officer[p] ? '✔' : '—', perm.member[p] ? '✔' : '—']))}
    <h2>Klan binası</h2>
    <p>Klan binası ${data.clan.buildingMax} seviyeye kadar geliştirilir; her seviye yeni klan boss'unun kilidini açar. Gerekli altın ve elmas klan hazinesinden ödenir.</p>
    ${table(['Seviye', 'Altın', 'Elmas'], Object.entries(data.clan.buildingCost).map(([lvl, c]) => [lvl, num(c.gold), num(c.diamonds)]))}
    <h2>Klan deneyim bonusu</h2>
    ${table(['Üye sayısı', 'Deneyim bonusu'], data.clan.expTiers.slice().reverse().map((t) => [`${t.min}+`, `%${Math.round(t.bonus * 100)}`]))}
  `);

  // ---------------- Savaş alanı
  const wz = data.warzone;
  wiki('savas-alani', 'Wiki · Savaş alanı', 'Savaş alanı bosslarının programı, canavar avı ve haftalık sıralama ödülleri.', `
    <h1>Savaş alanı</h1>
    <p class="lead">Savaş alanı, <strong>${wz.unlockLevel}. seviyeden</strong> sonra açılır. Ortak bosslar, güçlendirilmiş canavar avı ve haftalık sıralama burada.</p>
    <ul>
      <li><strong>Işınlanma:</strong> ${num(wz.teleportCost)} altın.</li>
      <li><strong>Dünya boss'ları:</strong> yaklaşık her ${wz.bossSlotHours} saatte bir ortaya çıkar. Toplanma süresinden sonra herkes ${wz.fightWindowMin} dakika boyunca vurur; toplam hasarına göre ödül alırsın.</li>
      <li><strong>Canavar avı:</strong> canavarlar ${wz.huntPower}× güçlüdür, ödül altını ${wz.huntGold}×, eşya/sandık şansı ${wz.huntDrop}× artar.</li>
      <li><strong>Haftalık sıralama:</strong> ilk 3 oyuncu elmas kazanır: ${data.weeklyRank.map((v, i) => `${i + 1}. ${num(v)}`).join(', ')}. Sıralama her hafta sıfırlanır.</li>
    </ul>
    <h2>Savaş alanı boss'ları</h2>
    ${table(['Boss', 'Can', 'Saldırı', 'Savunma'], wz.bosses.map((b) => [`<strong style="color:${b.color}">${esc(b.name)}</strong>`, num(b.hp), num(b.atk), num(b.def)]))}
  `);

  // ---------------- Ekonomi
  const potionRows = (kind, label) => data.potions[kind].map((amount, i) => [esc(data.potions.names[kind][i]), `${num(amount)} ${label}`, `${num(data.potions.prices[kind][i])} altın`]);
  wiki('ekonomi', 'Wiki · Ekonomi ve elmas', 'Altın, elmas, iksirler, pazar, premium üyelik ve günlük ödüller.', `
    <h1>Ekonomi ve elmas</h1>
    <h2>Altın ve elmas</h2>
    <p><strong>Altın</strong> oyun içinde kazanılır: avlanarak, görevlerle, eşya satarak. <strong>Elmas</strong> özel para birimidir; günlük giriş ve haftalık sıralama ile kazanılır; mağaza satın alımı açıldığında Apple/Google üzerinden de alınabilir (elmaslar sunucuda doğrulanarak hesabına yazılır).</p>
    <h2>İksirlar</h2>
    ${table(['İksir', 'Etki', 'Fiyat'], [...potionRows('hp', 'can'), ...potionRows('mp', 'mana')])}
    <h2>Pazar</h2>
    <p>Eşyalarını oyuncu pazarında tezgâha koyarak diğer oyunculara satabilirsin. Tezgâh en fazla ${data.market.maxItems} eşya alır; süre seçilir ve süreye göre altın ücreti vardır.</p>
    ${table(['Süre', 'Tezgâh ücreti'], data.market.hours.map((h) => [`${h} saat`, `${num(data.market.fee[h])} altın`]))}
    <h2>Günlük ve haftalık ödüller</h2>
    ${table(['Gün', 'Altın', 'Elmas', 'Diğer'], data.daily.login.map((d) => [d.day, num(d.gold), d.diamonds || '—', [d.scrollCount ? `${d.scrollCount} parşömen` : '', d.chestTier ? 'Sandık' : '', d.bonusScroll ? 'Bonus parşömen' : ''].filter(Boolean).join(', ') || '—']))}
    <p class="muted">Giriş serisi 7 gün sürer; günde bir kez alınır.</p>
    ${table(['Günlük görev hedefi', 'Altın', 'Deneyim', 'Sandık'], data.daily.quests.map((q) => [`${q.target} canavar`, num(q.goldReward), num(q.xpReward), q.chest ? '✔' : '—']))}
    ${table(['Haftalık görev', 'Hedef', 'Altın', 'Deneyim', 'Sandık'], data.weekly.map((q) => [`<strong>${esc(q.name)}</strong><br><small class="muted">${esc(q.desc)}</small>`, q.target, num(q.goldReward), num(q.xpReward), q.chest ? '✔' : '—']))}
    <h2>Zamanlı etkinlikler</h2>
    ${data.events.map((e) => `<p><strong>${esc(e.name)}</strong>: her gün ${String(e.hour).padStart(2, '0')}:${String(e.minute).padStart(2, '0')}, ${e.durationMinutes} dakika; etkinlik boyunca deneyim bonusu birikir.</p>`).join('')}
    <h2>Premium üyelik</h2>
    <p>Premium, ${data.premiumDays} gün sürer ve savaş otomatik oynama dahil avantaj verir.</p>
    ${table(['', 'Apex Premium', 'Mythic Premium'], [
      ['Elmas fiyatı', num(data.premium.apex.price), num(data.premium.mythic.price)],
      ['Deneyim', `×${data.premium.apex.expMult}`, `×${data.premium.mythic.expMult}`],
      ['Altın', `×${data.premium.apex.goldMult}`, `×${data.premium.mythic.goldMult}`],
      ['Eşya düşürme', `×${data.premium.apex.dropMult}`, `×${data.premium.mythic.dropMult}`],
      ['Satış geliri', `×${data.premium.apex.sellMult}`, `×${data.premium.mythic.sellMult}`],
      ['Tamir indirimi', `%${Math.round(data.premium.apex.repairDiscount * 100)}`, `%${Math.round(data.premium.mythic.repairDiscount * 100)}`],
      ['Ekstra depo sayfası', data.premium.apex.bankBonusPages || '—', data.premium.mythic.bankBonusPages || '—'],
    ])}
    <h2>Kanatlar ve takviyeler</h2>
    <p>Kanatlar görünüm ve küçük bonuslar verir (${data.wings.length} model, her biri ${num(data.wings[0]?.price)} elmas): ${data.wings.map((w) => `<span class="pill" style="--c:${w.color}">${esc(w.name)}</span>`).join(' ')}</p>
    <p>Takviye parşömenleri ${data.boosts.minutes} dakika boyunca etki eder; ${data.boosts.pack}'lik paketlerle alınır.</p>
    <h2>Hesap ve ücretsiz elmas</h2>
    <p>Başlangıçta ${data.characterSlots - 1} karakter yuvan vardır; 3. yuva ${num(data.prices.slotUnlock)} elmas.</p>
  `);

  // ---------------- SSS
  const faq = [
    ['Oyun ücretsiz mi?', 'Evet, Nyxia Online ücretsiz indirilir. İstersen elmas satın alabilirsin; oyunun tamamı elmas almadan da oynanır.'],
    ['Hesabımı başka telefonda açabilir miyim?', 'Evet. İlerlemen sunucuda saklanır. Hesap aynı anda tek yerde açık olabilir: başka cihazda giriş yaparsan oradaki oturum kapanır, hiçbir şey kaybolmaz.'],
    ['Şifremi unuttum, ne yapmalıyım?', 'Hesabına doğrulanmış bir e-posta eklediysen (Ayarlar → Hesap), giriş ekranındaki "Şifremi unuttum" ile e-postana kod gelir ve şifreni yenilersin. E-postan yoksa Destek sayfasından talep aç.'],
    ['Hile yapılabiliyor mu?', 'Savaşlar, ödüller ve ekonomi sunucuda hesaplanır ve hileye karşı korunur. Hile ve kötüye kullanım hesabın engellenmesine yol açar.'],
    ['Bir oyuncuyu nasıl şikayet ederim?', 'Oyun içinde sohbette ya da profilde şikayet düğmesini kullan; ayrıca Destek sayfasından da bildirebilirsin. Şikayetler incelenir.'],
    ['Hesabımı nasıl silerim?', 'Oyunda Ayarlar → Hesap → Hesabımı sil. Oyuna giremiyorsan Hesap Silme sayfasındaki adımlarla bize yaz.'],
    ['Satın aldığım elmas gelmedi.', 'Mağaza satın alımları sunucuda doğrulanır; birkaç dakika sürebilir. Gelmezse Destek sayfasından "Ödeme" kategorisiyle talep aç, makbuz numaranı ekle.'],
    ['Eşyam kayboldu / hata gördüm.', 'Destek sayfasından "Hata" kategorisiyle talep aç; ne olduğunu, saati ve karakter adını yaz.'],
  ];
  wiki('sss', 'Wiki · Sık sorulan sorular', 'Hesap, ödeme, hile ve destek hakkında sık sorulan sorular.', `
    <h1>Sık sorulan sorular</h1>
    ${faq.map(([q, a]) => `<details class="faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}
    <div class="callout">Aradığını bulamadın mı? <a href="../support.html">Destek talebi aç</a>.</div>
  `);

  return pages;
}

export const imgSrc = (path) => `../img/items/${imgKey(path)}.${/\.svg$/i.test(path) ? 'svg' : 'webp'}`;
export const imgKey = (path) => String(path).split('/').pop().replace(/\.[a-z0-9]+$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
