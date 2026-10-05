import {migrateCharacterClans,savedCharacters,characterKey,primaryCharacter} from './clan-characters.mjs';
const characterKeyOf = characterKey;
import webpush from 'web-push';
import { createAdmin } from './admin.mjs';
import {validAvatarFrame} from '../src/data/avatarFrames.js';
import {FIRST_PURCHASE_WEAPONS} from '../src/data/firstPurchaseWeapons.js';
import {MARKET_DURATIONS_HOURS as MARKET_DURATIONS, MARKET_STALL_MAX_ITEMS as MARKET_MAX_ITEMS, MARKET_MAX_PRICE} from '../src/data/market.js';
import {maskProfanity, containsProfanity, containsProfanityLoose} from '../src/data/profanity.js';
import {createWheel} from './wheel.mjs';
import {duelSnapshot} from './duel-snapshot.mjs';
import {createWallet} from './wallet.mjs';
import {createEntitlements} from './entitlements.mjs';
import {createIap} from './iap.mjs';
import {createGame} from './game.mjs';
import {WHEEL_PREMIUM_PRIZES} from '../src/data/diamondPrices.js';
import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, createHash, scrypt as derive, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import { resolve, extname, join } from 'node:path';
// Faz 4 — bu iki dosya kasıtlı olarak saf JS (tarayıcıya/React'e bağımlı
// değil, bkz. kendi dosyalarındaki importlar): boss listesini ve zamanlama
// mantığını istemciyle AYNI kaynaktan okumak için doğrudan buradan import
// ediliyor, sunucuda ayrı bir kopyası tutulmuyor (iki yerde birbirinden
// sapabilecek bir "boss listesi" olmasın diye).
import { WARZONE_BOSSES } from '../src/data/warzone.js';
import { bossSchedule } from '../src/utils/warzoneBoss.js';
// Faz 6 — arkadaş/özel mesaj/gerçek çok-oyunculu klan. Aynı Faz 4 ilkesi:
// saf veri dosyaları doğrudan buradan import ediliyor (klan üye/subay
// tavanı, bina maliyet tablosu) — istemci ile sunucu aynı sabitleri kullanır.
import { CLAN_MAX_MEMBERS, CLAN_MAX_OFFICERS, CLAN_COLORS } from '../src/data/clan.js';
import { CLAN_BUILDING_MAX_LEVEL, CLAN_BUILDING_UPGRADE_COST } from '../src/data/clanBoss.js';
import {validPlayerAvatar,validClanAvatar,playerAvatarId} from '../src/data/avatars.js';
import { FRIEND_MAX_COUNT, CHAT_MESSAGE_TTL_MS, DM_MESSAGE_TTL_MS } from '../src/data/social.js';
// Klan Dungeon (Clan Raid) — kullanıcının pasted spec'i: 20 aşamalı, paylaşılan
// HP havuzu, tek seferde 1 üye kilidi, günlük 2 giriş/20dk bekleme, sunucu
// saatiyle 00:00 sıfırlanma. Aşama gücü/malzeme tanımları istemciyle aynı
// kaynaktan (bkz. Faz 4/6'daki aynı ilke).
import { TOTAL_STAGES, CLAN_DUNGEON_DAILY_ENTRIES, CLAN_DUNGEON_COOLDOWN_MS, CLAN_DUNGEON_LOCK_TIMEOUT_MS, clanDungeonStage, rollClanDungeonMaterial, CLAN_BUILDING_MATERIAL_COST } from '../src/data/clanDungeon.js';
// Kullanıcı isteği: "telefona bildirim gönderme sistemini kurmanı
// istiyorum... inaktif oyuncu geri çağırma... etkinlik hatırlatması...
// arkadaş/mesaj bildirimi... ayarlardan aç/kapa." Native (Capacitor/FCM)
// gerçek bir seçenek değil — android/ klasörü sadece yerel test amaçlı
// (appId "com.rpgmarket.testapp", google-services.json hiç yok, Play
// Store'da değil) ve FCM için kullanıcının ayrı bir Firebase projesi
// kurup bana kimlik bilgisi vermesi gerekirdi. Bunun yerine VAPID tabanlı
// Web Push (tarayıcı Notification API + Service Worker) — anahtarlar
// kendi kendine üretiliyor, dışarıdan hiçbir hesap gerekmiyor, ve asıl
// oyuncu kitlesi zaten tarayıcıdan oynuyor (nyxia.sametcantas.com).
// SCHEDULED_EVENTS saf veri (bkz. Faz 4 notu) — server/app.mjs'in
// kullandığı istanbul-saat matematiği utils/scheduledEvents.js#eventPhase
// ile AYNI ama o dosya kendi ../utils/player importunu uzantısız yaptığı
// için (bkz. bu kod tabanındaki bilinen, kasıtlı ele alınmamış src/
// genelindeki uzantısız-import sorunu) sunucudan güvenle import edilemiyor
// — bu yüzden sadece o tek formül burada (aşağıdaki scheduledEventPreopenAt)
// kasıtlı olarak yeniden yazıldı, veri (saat/dakika/preOpenMinutes) yine
// tek kaynaktan (bu import) geliyor.
import { SCHEDULED_EVENTS } from '../src/data/scheduledEvents.js';
import { todayKey } from '../src/utils/day.js';

const scrypt = promisify(derive);
const hash = value => createHash('sha256').update(value).digest('hex');
const fail = (status, code) => Object.assign(new Error(code), { status });
const LIMIT = 2 * 1024 * 1024;
// Push bildirimleri prod'da systemd unit'ine env olarak eklenen VAPID
// anahtarlarıyla çalışır (bkz. deploy notları) — hiçbir zaman koda/git'e
// yazılmaz. Anahtarlar yoksa (yerel dev, testler) PUSH_ENABLED false kalır
// ve tüm push çağrıları sessizce no-op olur — özellik varlığı isteğe bağlı.
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:nyxia-online@example.com';
const PUSH_ENABLED = !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
if (PUSH_ENABLED) webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
const PUSH_CHECK_INTERVAL_MS = Number(process.env.PUSH_CHECK_INTERVAL_MS) || 60 * 1000;
const INACTIVITY_DAYS = 3;
const INACTIVITY_RESEND_COOLDOWN_DAYS = 7;
const ISTANBUL_UTC_OFFSET_MS = 3 * 60 * 60 * 1000;
function scheduledEventPreopenAt(event, now) {
  const ist = new Date(now + ISTANBUL_UTC_OFFSET_MS);
  const istanbulLocalAsUtc = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), event.hour, event.minute, 0, 0);
  return (istanbulLocalAsUtc - ISTANBUL_UTC_OFFSET_MS) - event.preOpenMinutes * 60000;
}
function istanbulDateKeyAt(now) {
  return new Date(now + ISTANBUL_UTC_OFFSET_MS).toISOString().slice(0, 10);
}
const MARKET_DURATIONS_HOURS = new Set(MARKET_DURATIONS);
const MARKET_STALL_MAX_ITEMS = MARKET_MAX_ITEMS;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };

// Derlenmiş oyunu (staticDir, ör. dist-server/) API ile AYNI origin'den
// sunmak için — böylece VM üzerinde tek HTTP girişi yeterli olur, ayrıca
// çerez SameSite=Strict cross-site sorunlarına hiç takılmaz. Bilinmeyen
// yollar index.html'e düşer (SPA); gerçek dosya isteği path traversal'a
// karşı staticDir dışına çıkamaz (resolve+startsWith kontrolü).
async function serveStatic(res, staticDir, reqPath) {
  const safePath = resolve(join(staticDir, decodeURIComponent(reqPath)));
  const target = safePath.startsWith(resolve(staticDir)) ? safePath : staticDir;
  for (const candidate of [target, join(staticDir, 'index.html')]) {
    try {
      const body = await readFile(candidate);
      res.writeHead(200, { 'Content-Type': MIME[extname(candidate)] || 'application/octet-stream', 'Cache-Control': candidate.endsWith('.html') ? 'no-store' : 'public, max-age=31536000, immutable' });
      return res.end(body);
    } catch { /* dosya yok, sıradaki adaya (SPA fallback) düş */ }
  }
  res.writeHead(404); res.end('Not Found');
}

const stallActive = (row, now) => !!row && now < row.listed_at + row.duration_hours * 3600000;
// Klan Dungeon malzeme anahtarı -> klan hazinesi kolonu (bkz. clans tablosu migrasyonu).
// Mantıksal malzeme anahtarı (wood/silver/iron/gold, bkz. data/clanDungeon.js)
// -> fiziksel DB kolonu. Kolon adları eski isimlerden kalma (root_fragment vb.)
// ama tamamen içsel/görünmez bir detay — hiçbir API yanıtı ham kolon adını
// döndürmüyor, bu yüzden yeniden adlandırmaya (ve migrasyona) gerek yok.
const CLAN_MATERIAL_COLUMN = { wood: 'treasury_root_fragment', silver: 'treasury_midboss_trophy', iron: 'treasury_twilight_essence', goldBar: 'treasury_finalboss_trophy' };

// Client backups are deliberately separate from future authoritative game state.
// Capacitor WebView'larının sabit origin'leri: Android https://localhost,
// iOS capacitor://localhost. Bu origin'lerden gelen istekler çerezle değil
// Bearer token ile yetkilenir (SameSite=Strict çerez WebView'dan gönderilmez).
export // Oyun mantığı paketi (npm run build:logic ile üretilir). Yoksa sunucu otoritesi kapalı kalır.
const gameLogic = await import('./game-logic.generated.mjs').catch(() => null);

const NATIVE_APP_ORIGINS = ['https://localhost', 'capacitor://localhost'];
export function createApi({ database = ':memory:', origin = 'http://localhost:5177', secure = true, staticDir = null, trustedProxy = null, nativeOrigins = NATIVE_APP_ORIGINS, iapWebhookSecret = null, iapAllowSandbox = false, economyForAll = false } = {}) {
  const allowedOrigins = new Set([origin, ...nativeOrigins]);
  const db = new DatabaseSync(database);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS accounts(id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL, salt TEXT NOT NULL, password TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, account INTEGER NOT NULL REFERENCES accounts(id), expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS backups(account INTEGER PRIMARY KEY REFERENCES accounts(id), revision INTEGER NOT NULL, data TEXT NOT NULL, updated INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS backup_history(account INTEGER NOT NULL REFERENCES accounts(id), revision INTEGER NOT NULL, data TEXT NOT NULL, updated INTEGER NOT NULL, PRIMARY KEY(account,revision));
    CREATE TABLE IF NOT EXISTS chat_messages(id INTEGER PRIMARY KEY AUTOINCREMENT, author TEXT NOT NULL, text TEXT NOT NULL, is_gm INTEGER NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS market_stalls(account INTEGER PRIMARY KEY REFERENCES accounts(id), seller_name TEXT NOT NULL, items TEXT NOT NULL, listed_at INTEGER NOT NULL, duration_hours INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS boss_fights(boss_id TEXT NOT NULL, spawn_at INTEGER NOT NULL, hp INTEGER NOT NULL, resolved INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(boss_id,spawn_at));
    CREATE TABLE IF NOT EXISTS boss_contributions(boss_id TEXT NOT NULL, spawn_at INTEGER NOT NULL, account INTEGER NOT NULL REFERENCES accounts(id), damage INTEGER NOT NULL, PRIMARY KEY(boss_id,spawn_at,account));
    CREATE TABLE IF NOT EXISTS duel_pending(account INTEGER PRIMARY KEY REFERENCES accounts(id), opponent_account INTEGER NOT NULL, opponent TEXT NOT NULL, seed INTEGER NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS pending_grants(id INTEGER PRIMARY KEY AUTOINCREMENT, account INTEGER NOT NULL REFERENCES accounts(id), character_key TEXT NOT NULL, kind TEXT NOT NULL, grant_key TEXT NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS boss_loot_claims(id INTEGER PRIMARY KEY AUTOINCREMENT, account INTEGER NOT NULL REFERENCES accounts(id), boss_id TEXT NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS duel_history(id INTEGER PRIMARY KEY AUTOINCREMENT, challenger INTEGER NOT NULL REFERENCES accounts(id), opponent INTEGER NOT NULL REFERENCES accounts(id), winner TEXT NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS friend_requests(id INTEGER PRIMARY KEY AUTOINCREMENT, from_account INTEGER NOT NULL REFERENCES accounts(id), to_account INTEGER NOT NULL REFERENCES accounts(id), created_at INTEGER NOT NULL, UNIQUE(from_account,to_account));
    CREATE TABLE IF NOT EXISTS friendships(account_a INTEGER NOT NULL REFERENCES accounts(id), account_b INTEGER NOT NULL REFERENCES accounts(id), created_at INTEGER NOT NULL, PRIMARY KEY(account_a,account_b));
    CREATE TABLE IF NOT EXISTS direct_messages(id INTEGER PRIMARY KEY AUTOINCREMENT, from_account INTEGER NOT NULL REFERENCES accounts(id), to_account INTEGER NOT NULL REFERENCES accounts(id), text TEXT NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS clans(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL, color TEXT NOT NULL, founder_account INTEGER NOT NULL REFERENCES accounts(id), created_at INTEGER NOT NULL, building_level INTEGER NOT NULL DEFAULT 1, treasury_gold INTEGER NOT NULL DEFAULT 0, treasury_diamonds INTEGER NOT NULL DEFAULT 0, treasury_np INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS clan_members(account_id INTEGER PRIMARY KEY REFERENCES accounts(id), clan_id INTEGER NOT NULL REFERENCES clans(id), role TEXT NOT NULL, joined_at INTEGER NOT NULL, donated_np INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS clan_invites(id INTEGER PRIMARY KEY AUTOINCREMENT, clan_id INTEGER NOT NULL REFERENCES clans(id), from_account INTEGER NOT NULL REFERENCES accounts(id), to_account INTEGER NOT NULL REFERENCES accounts(id), created_at INTEGER NOT NULL, UNIQUE(clan_id,to_account));
    CREATE TABLE IF NOT EXISTS clan_dungeon_state(clan_id INTEGER PRIMARY KEY REFERENCES clans(id), day_key TEXT NOT NULL, stage_index INTEGER NOT NULL DEFAULT 1, monster_hp INTEGER NOT NULL DEFAULT 0, completed INTEGER NOT NULL DEFAULT 0, locked_by INTEGER REFERENCES accounts(id), locked_by_name TEXT, locked_until INTEGER);
    CREATE TABLE IF NOT EXISTS clan_dungeon_attempts(account_id INTEGER NOT NULL REFERENCES accounts(id), day_key TEXT NOT NULL, entries_used INTEGER NOT NULL DEFAULT 0, first_entry_at INTEGER, PRIMARY KEY(account_id,day_key));
    CREATE TABLE IF NOT EXISTS clan_dungeon_log(id INTEGER PRIMARY KEY AUTOINCREMENT, clan_id INTEGER NOT NULL REFERENCES clans(id), day_key TEXT NOT NULL, account_name TEXT NOT NULL, stage_index INTEGER NOT NULL, damage INTEGER NOT NULL, killed INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS push_subscriptions(account_id INTEGER NOT NULL REFERENCES accounts(id), endpoint TEXT NOT NULL, p256dh TEXT NOT NULL, auth TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY(account_id,endpoint));
    CREATE TABLE IF NOT EXISTS push_prefs(account_id INTEGER PRIMARY KEY REFERENCES accounts(id), inactivity INTEGER NOT NULL DEFAULT 1, events INTEGER NOT NULL DEFAULT 1, social INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS push_inactivity_sent(account_id INTEGER PRIMARY KEY REFERENCES accounts(id), sent_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS push_event_sent(event_id TEXT NOT NULL, day_key TEXT NOT NULL, PRIMARY KEY(event_id,day_key));`);
  migrateCharacterClans(db);
  // Başlangıçta bir kerelik temizlik — hafta öncesinin boss kayıtları hiç
  // kullanılmayacak, DB'nin sınırsız büyümesini önler.
  {
    const cutoff = Date.now() - 7 * 86400000;
    db.prepare('DELETE FROM boss_contributions WHERE spawn_at < ?').run(cutoff);
    db.prepare('DELETE FROM boss_fights WHERE spawn_at < ?').run(cutoff);
    // day_key ("Thu Jan 01 1970" gibi toDateString çıktısı) alfabetik sırayla
    // kronolojik sıralanmıyor, bu yüzden < karşılaştırması yerine "bugün
    // değilse sil" — dünün giriş hakkı/cooldown'u zaten hiçbir zaman tekrar
    // okunmayacak.
    db.prepare('DELETE FROM clan_dungeon_attempts WHERE day_key <> ?').run(todayKey());
    db.prepare('DELETE FROM clan_dungeon_log WHERE day_key <> ?').run(todayKey());
    // push_event_sent kendi İstanbul-saatli gün anahtarını kullanıyor
    // (yukarıdaki todayKey() cihaz/sunucu yerel tarihi, farklı bir biçim) —
    // karıştırılmasın diye ayrı bir silme.
    db.prepare('DELETE FROM push_event_sent WHERE day_key <> ?').run(istanbulDateKeyAt(Date.now()));
  }
  // Ters proxy arkasında (Caddy) her istek soket düzeyinde AYNI adresten
  // (proxy'nin kendisinden) geliyor — X-Forwarded-For'a körü körüne
  // güvenmek sahte üstbilgiyle rate-limit'i atlatmaya açar, bu yüzden
  // sadece doğrudan TCP bağlantısı `trustedProxy` ise (Caddy'nin kendi IP'si)
  // o üstbilgiye bakılıyor; başka her yerden gelen istekte soket adresi esas alınır.
  const clientAddress = req => {
    if (trustedProxy && req.socket.remoteAddress === trustedProxy && req.headers['x-forwarded-for']) {
      return req.headers['x-forwarded-for'].split(',')[0].trim();
    }
    return req.socket.remoteAddress;
  };
  // Genel bir dakikalık pencere sayacı — spam/kaba-kuvvet önleme, gerçek
  // yetkilendirme değil. Her çağıran kendi Map'ini ve limitini tutar (IP
  // bazlı register/login, hesap bazlı chat/boss saldırısı gibi).
  const makeRateLimiter = max => {
    const attempts = new Map();
    return key => {
      const now = Date.now();
      for (const [k, value] of attempts) if (value.until < now) attempts.delete(k);
      const entry = attempts.get(key) || { count: 0, until: now + 60000 };
      if (++entry.count > max || attempts.size > 10000) throw fail(429, 'TOO_MANY_ATTEMPTS');
      attempts.set(key, entry);
    };
  };
  const rateLimit = makeRateLimiter(12);
  // Hesap başına, IP'den bağımsız (Caddy arkasında birçok oyuncu aynı IP'yi
  // paylaşabilir) — spam önleme, gerçek yetkilendirme değil.
  // Additive migrations preserve existing messages and memberships.
  for(const [table,fallback] of [['chat_messages','human-warrior'],['direct_messages','human-warrior'],['clans','wolf']]){
    if(!db.prepare(`PRAGMA table_info(${table})`).all().some(c=>c.name==='avatar_id'))db.exec(`ALTER TABLE ${table} ADD COLUMN avatar_id TEXT NOT NULL DEFAULT '${fallback}'`);
    if(table!=='clans'&&!db.prepare(`PRAGMA table_info(${table})`).all().some(c=>c.name==='frame_id'))db.exec(`ALTER TABLE ${table} ADD COLUMN frame_id TEXT`);
  }
  // Oyuncu-oyuncu engelleme ve şikayet (Apple 1.2 / Google UGC politikası).
  // user_blocks oyuncunun kendi engel listesi; hesap cezaları (ban/mute) ayrı
  // ve admin.mjs'te (account_blocks). Sohbet mesajına hesap kimliği bağlanır ki
  // genel sohbetten şikayet/engelleme yapılabilsin; istemciye hiç verilmez.
  db.exec(`CREATE TABLE IF NOT EXISTS user_blocks(blocker INTEGER NOT NULL REFERENCES accounts(id), blocked INTEGER NOT NULL REFERENCES accounts(id), created_at INTEGER NOT NULL, PRIMARY KEY(blocker,blocked));
    CREATE TABLE IF NOT EXISTS user_reports(id INTEGER PRIMARY KEY AUTOINCREMENT, reporter INTEGER REFERENCES accounts(id), target INTEGER REFERENCES accounts(id), target_name TEXT NOT NULL, context TEXT NOT NULL, content TEXT NOT NULL DEFAULT '', reason TEXT NOT NULL, details TEXT NOT NULL DEFAULT '', created_at INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'open', resolved_at INTEGER, resolution TEXT);`);
  if (!db.prepare('PRAGMA table_info(chat_messages)').all().some(c => c.name === 'account_id')) db.exec('ALTER TABLE chat_messages ADD COLUMN account_id INTEGER');
  // Klan Dungeon malzeme hazinesi — bina yükseltmesi artık altın/elmasın
  // yanında bu 4 malzeyi de istiyor (bkz. data/clanDungeon.js#CLAN_BUILDING_MATERIAL_COST).
  // Bağış akışı gold/diamonds/np ile birebir aynı (bkz. /api/clan/donate).
  for (const col of ['treasury_root_fragment', 'treasury_midboss_trophy', 'treasury_twilight_essence', 'treasury_finalboss_trophy']) {
    if (!db.prepare('PRAGMA table_info(clans)').all().some(c => c.name === col)) db.exec(`ALTER TABLE clans ADD COLUMN ${col} INTEGER NOT NULL DEFAULT 0`);
  }
  const chatRateLimit = makeRateLimiter(20);
  const bossAttackRateLimit = makeRateLimiter(60);
  const duelRateLimit = makeRateLimiter(20);
  const socialRateLimit = makeRateLimiter(30);
  const dmRateLimit = makeRateLimiter(30);
  const read = async req => {
    let size = 0; const chunks = [];
    for await (const chunk of req) {
      size += chunk.length;
      if (size > LIMIT) throw fail(413, 'BACKUP_TOO_LARGE');
      chunks.push(chunk);
    }
    try { return JSON.parse(Buffer.concat(chunks).toString()); } catch { throw fail(400, 'INVALID_JSON'); }
  };
  const wallet = createWallet(db, { fail });
  const entitlements = createEntitlements(db, { fail });
  // Satıcıya ödeme: satıcının yedeğindeki depo altınına eklenir (satıcı çevrimdışı olabilir).
  // Sunucu ekonomisinde depo altını zaten yalnızca sunucudaki değerden okunur.
  function creditSellerBankGold(sellerId, amount) {
    const sellerBackup = db.prepare('SELECT * FROM backups WHERE account=?').get(sellerId);
    if (!sellerBackup) return;
    const data = JSON.parse(sellerBackup.data);
    data.bankGold = Math.min(2000000000, (data.bankGold || 0) + amount);
    const revision = sellerBackup.revision + 1, now = Date.now(), json = JSON.stringify(data);
    db.prepare('INSERT INTO backup_history VALUES(?,?,?,?)').run(sellerId, revision, json, now);
    db.prepare('INSERT OR REPLACE INTO backups VALUES(?,?,?,?)').run(sellerId, revision, json, now);
    db.prepare('DELETE FROM backup_history WHERE account=? AND revision<=?').run(sellerId, revision - 20);
  }
  // Klandan çıkarma satırları (isteğin ve sunucu eyleminin ortak parçası; çağıran işlem açar/kapatır).
  function removeFromClan(membership, accountId, characterKey) {
    db.prepare('UPDATE clan_dungeon_state SET locked_by=NULL,locked_character=NULL,locked_by_name=NULL,locked_until=NULL WHERE clan_id=? AND locked_by=? AND locked_character=?').run(membership.clan_id, accountId, characterKey);
    db.prepare('DELETE FROM clan_members WHERE account_id=? AND character_key=?').run(accountId, characterKey);
    if (membership.role === 'leader') {
      const next = db.prepare("SELECT account_id,character_key FROM clan_members WHERE clan_id=? ORDER BY CASE role WHEN 'officer' THEN 0 ELSE 1 END, joined_at ASC LIMIT 1").get(membership.clan_id);
      if (next) db.prepare("UPDATE clan_members SET role='leader' WHERE account_id=? AND character_key=?").run(next.account_id, next.character_key);
      else {
        db.prepare('DELETE FROM clan_invites WHERE clan_id=?').run(membership.clan_id);
        db.prepare('DELETE FROM clan_dungeon_log WHERE clan_id=?').run(membership.clan_id);
        db.prepare('DELETE FROM clan_dungeon_state WHERE clan_id=?').run(membership.clan_id);
        db.prepare('DELETE FROM clans WHERE id=?').run(membership.clan_id);
      }
    }
  }
  // Düello rakibi: seviyeye yakın, engellenmemiş gerçek bir hesabın en yüksek seviyeli karakterinin
  // düello için gereken alanları (özel veriler çıkarılmış). Hem eski uç hem sunucu eylemi kullanır.
  function pickDuelOpponent(accountId, level) {
    const rows = db.prepare('SELECT backups.account AS account, backups.data AS data, accounts.name AS accountName FROM backups JOIN accounts ON accounts.id = backups.account WHERE backups.account != ? AND backups.account NOT IN (SELECT blocked FROM user_blocks WHERE blocker=? UNION SELECT blocker FROM user_blocks WHERE blocked=?)').all(accountId, accountId, accountId);
    const candidates = [];
    for (const row of rows) {
      let data;
      try { data = JSON.parse(row.data); } catch { continue; }
      const chars = Array.isArray(data?.characters) ? data.characters.filter(Boolean) : [];
      if (chars.length === 0) continue;
      const main = chars.reduce((best, c) => (!best || (c.level || 0) > (best.level || 0) ? c : best), null);
      if (!main) continue;
      candidates.push({ accountId: row.account, accountName: row.accountName, character: main });
    }
    const inRange = candidates.filter(c => Math.abs((c.character.level || 1) - level) <= 15);
    const pool = inRange.length > 0 ? inRange : candidates;
    if (pool.length === 0) return null;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    const seed = randomBytes(4).readUInt32BE(0) || 1;
    return { opponentAccountId: picked.accountId, opponentName: picked.character.nickname || picked.accountName, opponent: duelSnapshot(picked.character), seed };
  }
  // Uygulama ayarları (en düşük istemci sürümü, güncelleme bağlantısı): DB'deki değer, yoksa ortam değişkeni.
  db.exec('CREATE TABLE IF NOT EXISTS app_config(key TEXT PRIMARY KEY, value TEXT NOT NULL)');
  let configCache = { at: 0, value: { minBuild: 0, updateUrl: null } };
  function appConfig() {
    const now = Date.now();
    if (now - configCache.at < 5000) return configCache.value;
    const read = (key) => db.prepare('SELECT value FROM app_config WHERE key=?').get(key)?.value;
    configCache = { at: now, value: { minBuild: Number(read('min_build') ?? process.env.MIN_CLIENT_BUILD ?? 0) || 0, updateUrl: read('update_url') ?? process.env.APP_UPDATE_URL ?? null } };
    return configCache.value;
  }
  // Paylaşımlı hedeflere (Dünya Canavarı / klan zindanı) tek istekte vurulabilecek en yüksek hasar: hesabın
  // karakterlerinin en güçlüsüne göre (bkz. src/game/fight.js maxActionDamage). Ayrıca hesap başına en kısa vuruş aralığı.
  const lastSharedHit = new Map();
  function checkSharedHit(accountId, targetDef, damage, now = Date.now()) {
    if (gameLogic?.maxActionDamage) {
      const row = db.prepare('SELECT data FROM backups WHERE account=?').get(accountId);
      let ceiling = 0;
      try { for (const c of JSON.parse(row?.data || '{}').characters || []) if (c) ceiling = Math.max(ceiling, gameLogic.maxActionDamage(c, targetDef)); } catch { /* bozuk yedek */ }
      if (ceiling > 0 && damage > ceiling) throw fail(400, 'INVALID_DAMAGE');
    }
    const last = lastSharedHit.get(accountId) || 0;
    if (now - last < 450) throw fail(429, 'TOO_FAST');
    lastSharedHit.set(accountId, now);
  }
  const game = createGame(db, { fail, logic: gameLogic, keyOf: characterKey, all: economyForAll, drops: () => admin.drops.get().data,
    hooks: {
      // Dünya Canavarı: hak, sunucudaki bekleyen kayıttır.
      'warzone/bossLoot': ({ account, payload }) => {
        const id = Number(payload?.claimId);
        const claim = Number.isInteger(id) ? db.prepare('SELECT id,boss_id FROM boss_loot_claims WHERE id=? AND account=?').get(id, account) : null;
        if (!claim) return { fail: 'noClaim' };
        return { payload: { bossId: claim.boss_id }, after: () => db.prepare('DELETE FROM boss_loot_claims WHERE id=? AND account=?').run(claim.id, account) };
      },
      // Günlük giriş: seri ve elmas bakiyesi cüzdanın günlük kaydından gelir (gün başına bir kez).
      'dailyLogin/claim': ({ account, characterKey, now }) => {
        const claim = wallet.dailyLoginInTransaction(account, characterKey, now);
        return { payload: { server: { streak: claim.streak, diamonds: claim.diamonds } } };
      },
      // Oyuncu pazarı: tezgah satırı (market_stalls) eşya/altın değişimiyle AYNI işlemde yazılır.
      'market/openStall': ({ account, payload, now }) => {
        const sellerName = typeof payload?.sellerName === 'string' ? payload.sellerName.trim().slice(0, 24) : '';
        const durationHours = Number(payload?.durationHours);
        if (!sellerName || !MARKET_DURATIONS_HOURS.has(durationHours)) return { fail: 'stallOpenFailed' };
        const existing = db.prepare('SELECT * FROM market_stalls WHERE account=?').get(account);
        if (existing) return { fail: stallActive(existing, now) ? 'stallAlreadyOpen' : 'stallExpiredMustClose' };
        return {
          payload: { durationHours },
          after: () => db.prepare('INSERT INTO market_stalls(account,seller_name,items,listed_at,duration_hours) VALUES(?,?,?,?,?)').run(account, sellerName, '[]', now, durationHours),
        };
      },
      'market/addItem': ({ account, payload, now }) => {
        const row = db.prepare('SELECT * FROM market_stalls WHERE account=?').get(account);
        if (!row || !stallActive(row, now)) return { fail: 'noOpenStall' };
        if (JSON.parse(row.items).length >= MARKET_STALL_MAX_ITEMS) return { fail: 'stallFull' };
        return {
          payload: { itemId: payload?.itemId, price: Number(payload?.price), asChest: !!payload?.asChest },
          after: (result) => {
            const items = JSON.parse(row.items);
            items.push({ id: randomBytes(8).toString('hex'), item: result.item, price: Number(payload.price) });
            db.prepare('UPDATE market_stalls SET items=? WHERE account=?').run(JSON.stringify(items), account);
          },
        };
      },
      'market/buy': ({ account, payload, now }) => {
        const sellerId = Number(payload?.sellerId);
        const listingId = typeof payload?.listingId === 'string' ? payload.listingId : '';
        if (!Number.isSafeInteger(sellerId) || !listingId) return { fail: 'marketItemGone' };
        if (sellerId === account) return { fail: 'cannotBuyOwn' };
        const stallRow = db.prepare('SELECT * FROM market_stalls WHERE account=?').get(sellerId);
        if (!stallRow || !stallActive(stallRow, now)) return { fail: 'marketItemGone' };
        const items = JSON.parse(stallRow.items);
        const listing = items.find((entry) => entry.id === listingId);
        if (!listing) return { fail: 'marketItemGone' };
        return {
          payload: { listing },
          after: () => {
            const remaining = items.filter((entry) => entry.id !== listingId);
            if (remaining.length === 0) db.prepare('DELETE FROM market_stalls WHERE account=?').run(sellerId);
            else db.prepare('UPDATE market_stalls SET items=? WHERE account=?').run(JSON.stringify(remaining), sellerId);
            creditSellerBankGold(sellerId, listing.price);
          },
        };
      },
      'market/takeBack': ({ account, payload }) => {
        const row = db.prepare('SELECT * FROM market_stalls WHERE account=?').get(account);
        if (!row) return { payload: { entries: [] } };
        const wanted = new Set(Array.isArray(payload?.itemIds) ? payload.itemIds : []);
        const entries = JSON.parse(row.items).filter((entry) => wanted.has(entry.id));
        return {
          payload: { entries },
          after: (result) => {
            const placed = new Set(result.placedIds);
            const remaining = JSON.parse(row.items).filter((entry) => !placed.has(entry.id));
            if (remaining.length === 0) db.prepare('DELETE FROM market_stalls WHERE account=?').run(account);
            else db.prepare('UPDATE market_stalls SET items=? WHERE account=?').run(JSON.stringify(remaining), account);
          },
        };
      },
      // Klan: bağış, hazineye ekleme ile oyuncudan düşme aynı işlemde; ayrılırken NP iadesi gerçek bağış toplamından.
      'clan/donate': ({ account, characterKey, payload }) => {
        const membership = db.prepare('SELECT * FROM clan_members WHERE account_id=? AND character_key=?').get(account, characterKey);
        if (!membership) return { fail: 'notInClan' };
        const currency = ['gold', 'np', ...Object.keys(CLAN_MATERIAL_COLUMN)].includes(payload?.currency) ? payload.currency : null;
        const amount = Number(payload?.amount);
        if (!currency || !Number.isSafeInteger(amount) || amount <= 0) return { fail: 'invalidDonation' };
        const column = CLAN_MATERIAL_COLUMN[currency] || (currency === 'gold' ? 'treasury_gold' : 'treasury_np');
        return {
          payload: { currency, amount },
          after: () => {
            db.prepare(`UPDATE clans SET ${column} = ${column} + ? WHERE id=?`).run(amount, membership.clan_id);
            if (currency === 'np') db.prepare('UPDATE clan_members SET donated_np = donated_np + ? WHERE account_id=? AND character_key=?').run(amount, account, characterKey);
          },
        };
      },
      'clan/leave': ({ account, characterKey }) => {
        const membership = db.prepare('SELECT * FROM clan_members WHERE account_id=? AND character_key=?').get(account, characterKey);
        if (!membership) return { fail: 'notInClan' };
        return { payload: { donatedNp: membership.donated_np }, after: () => removeFromClan(membership, account, characterKey) };
      },
      // Klan zindanında düşen malzemeler önce `pending_grants`a yazılır; oyuncuya bu eylemle verilir.
      'clan/claimMaterials': ({ account, characterKey }) => {
        const rows = db.prepare("SELECT id,grant_key FROM pending_grants WHERE account=? AND character_key=? AND kind='clanMaterial' ORDER BY id").all(account, characterKey);
        if (rows.length === 0) return { fail: 'nothingToClaim' };
        return {
          payload: { materials: rows.map((r) => r.grant_key) },
          after: (result) => { for (const row of rows.slice(0, result.placed)) db.prepare('DELETE FROM pending_grants WHERE id=?').run(row.id); },
        };
      },
      // Elmasla alınan eşya/paketler: tahsilat (fiyatı sunucu belirler) ve teslim aynı işlemde; teslim olmazsa elmas düşmez.
      'diamond/buy': ({ account, characterKey: ck, payload, now }) => {
        const kind = String(payload?.kind);
        const key = payload?.key == null ? null : String(payload.key);
        if (!['premium', 'wings', 'bonusScroll', 'raceScroll', 'jobScroll', 'dungeonEntry', 'bankPage', 'boostPack'].includes(kind)) return { fail: 'invalidPurchase' };
        if (kind === 'premium') entitlements.checkPremium(account, ck, key, characterKey, now);
        const paid = wallet.spendInTransaction(account, kind, key, ck, now);
        if (kind === 'premium') entitlements.grantPremium(account, ck, key, 'purchase', now);
        return { payload: { kind, key, diamonds: paid.diamonds, price: paid.price } };
      },
      // GM araçları: yetki hesaba bağlı GM listesinden sunucuda denetlenir.
      ...Object.fromEntries(['gm/exec', 'gm/give', 'gm/clearInventory', 'gm/giveAllChests'].map((type) => [type, ({ account, payload }) => (admin.isGm(account) ? { payload } : { fail: 'notGm' })])),
      // Savaş Alanı düellosu: rakip ve tohum sunucudan, sonuç sunucuda aynı motorla hesaplanır.
      'duel/start': ({ account, payload, now }) => {
        const pending = db.prepare('SELECT * FROM duel_pending WHERE account=?').get(account);
        if (pending && now - pending.created_at < 3000) return { fail: 'tooSoon' };
        const picked = pickDuelOpponent(account, Number(payload?.level) || 1);
        if (!picked) return { fail: 'noOpponent' };
        return {
          payload: { ...picked, forfeit: !!pending },
          after: () => {
            if (pending) db.prepare('INSERT INTO duel_history(challenger,opponent,winner,created_at) VALUES(?,?,?,?)').run(account, pending.opponent_account, 'opponent', now);
            db.prepare('INSERT OR REPLACE INTO duel_pending(account,opponent_account,opponent,seed,created_at) VALUES(?,?,?,?,?)').run(account, picked.opponentAccountId, JSON.stringify(picked.opponent), picked.seed, now);
          },
        };
      },
      'duel/resolve': ({ account, now }) => {
        const pending = db.prepare('SELECT * FROM duel_pending WHERE account=?').get(account);
        if (!pending) return { fail: 'noDuel' };
        if (now - pending.created_at < 4000) return { fail: 'tooFast' };
        return {
          payload: { opponent: JSON.parse(pending.opponent), seed: pending.seed },
          after: (result) => {
            db.prepare('DELETE FROM duel_pending WHERE account=?').run(account);
            db.prepare('INSERT INTO duel_history(challenger,opponent,winner,created_at) VALUES(?,?,?,?)').run(account, pending.opponent_account, result.winner, now);
          },
        };
      },
      'duel/concede': ({ account, now }) => {
        const pending = db.prepare('SELECT * FROM duel_pending WHERE account=?').get(account);
        if (!pending) return { fail: 'noDuel' };
        return {
          payload: { opponent: JSON.parse(pending.opponent) },
          after: () => {
            db.prepare('DELETE FROM duel_pending WHERE account=?').run(account);
            db.prepare('INSERT INTO duel_history(challenger,opponent,winner,created_at) VALUES(?,?,?,?)').run(account, pending.opponent_account, 'opponent', now);
          },
        };
      },
      // Çark: ödül, sunucunun çevirme sırasında seçtiği bekleyen kayıttır (premium ödüller ayrı yoldan).
      'wheel/claimItem': ({ account }) => {
        const pending = wheel.pendingPrize(account);
        if (!pending) return { fail: 'noPendingPrize' };
        return { payload: pending, after: () => wheel.claim(account) };
      },
    } });
  const actRateLimit = makeRateLimiter(240);
  const iap = createIap(db, { fail, wallet, secret: iapWebhookSecret, allowSandbox: iapAllowSandbox });
  const admin = createAdmin(db, { read, fail, wallet });
  const wheel = createWheel(db, { fail });
  const wheelRateLimit = makeRateLimiter(20);
  const walletRateLimit = makeRateLimiter(60);
  const validCharacterKey = (value) => (typeof value === 'string' && /^[\w:.-]{1,64}$/.test(value) ? value : null);
  // Push bildirimleri — bkz. dosyanın en üstündeki VAPID/kapsam notu. Bir
  // hesabın kendi tercihi (push_prefs) kategoriyi kapatmışsa hiç gönderilmez;
  // tercih hiç kaydedilmemişse varsayılan açık (satır yoksa `prefs` null,
  // `!prefs || prefs[category]` true kalır). 404/410 (abonelik artık geçersiz
  // — kullanıcı bildirimleri kapattı/tarayıcı verisini sildi) sessizce o
  // aboneliği siler, başka bir hata akışı bozmasın diye yutulur.
  async function sendPush(accountId, category, payload) {
    if (!PUSH_ENABLED) return;
    const prefs = db.prepare('SELECT * FROM push_prefs WHERE account_id=?').get(accountId);
    if (prefs && !prefs[category]) return;
    const subs = db.prepare('SELECT * FROM push_subscriptions WHERE account_id=?').all(accountId);
    for (const sub of subs) {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(payload));
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          db.prepare('DELETE FROM push_subscriptions WHERE account_id=? AND endpoint=?').run(accountId, sub.endpoint);
        }
      }
    }
  }
  // Kullanıcı isteği: "Bir süre oyuna girmeyen oyuncuları oyuna çekebilmek
  // için Karakterin Seni Özledi! gibi olabilir." INACTIVITY_DAYS'ten uzun
  // süredir hiç kayıt (backup) göndermemiş VE en az bir push aboneliği olan
  // hesaplara, INACTIVITY_RESEND_COOLDOWN_DAYS'te bir defadan fazla olmayacak
  // şekilde gönderilir (push_inactivity_sent aynı hesaba spam'i önlüyor).
  async function runInactivityCheck() {
    const now = Date.now();
    const cutoff = now - INACTIVITY_DAYS * 86400000;
    const cooldownCutoff = now - INACTIVITY_RESEND_COOLDOWN_DAYS * 86400000;
    const rows = db.prepare(`
      SELECT DISTINCT b.account AS id FROM backups b
      JOIN push_subscriptions ps ON ps.account_id = b.account
      LEFT JOIN push_inactivity_sent pis ON pis.account_id = b.account
      WHERE b.updated < ? AND (pis.sent_at IS NULL OR pis.sent_at < ?)
    `).all(cutoff, cooldownCutoff);
    for (const row of rows) {
      await sendPush(row.id, 'inactivity', { title: 'Karakterin seni özledi!', body: "Nyxia Online'da yeni maceralar seni bekliyor — bir uğra!", tag: 'inactivity', url: '/' });
      db.prepare('INSERT INTO push_inactivity_sent(account_id,sent_at) VALUES(?,?) ON CONFLICT(account_id) DO UPDATE SET sent_at=excluded.sent_at').run(row.id, now);
    }
  }
  // Kullanıcı isteği: "Etkinlik zamanları etkinlikten bir kaç dakika
  // öncesinde bildirim düşebilir." SCHEDULED_EVENTS'in kendi preOpenMinutes
  // penceresi zaten "bir kaç dakika önce" anlamına geliyor (bkz. dosyanın
  // üstündeki not) — o pencereye girilen ilk kontrolde, o günün ilk (ve tek)
  // bildirimi gönderilir (push_event_sent aynı gün için tekrarı engeller).
  async function runEventReminderCheck() {
    const now = Date.now();
    const dayKey = istanbulDateKeyAt(now);
    for (const event of SCHEDULED_EVENTS) {
      if (now < scheduledEventPreopenAt(event, now)) continue;
      if (db.prepare('SELECT 1 FROM push_event_sent WHERE event_id=? AND day_key=?').get(event.id, dayKey)) continue;
      db.prepare('INSERT OR IGNORE INTO push_event_sent(event_id,day_key) VALUES(?,?)').run(event.id, dayKey);
      const rows = db.prepare(`
        SELECT DISTINCT ps.account_id AS id FROM push_subscriptions ps
        LEFT JOIN push_prefs pp ON pp.account_id = ps.account_id
        WHERE pp.events IS NULL OR pp.events = 1
      `).all();
      for (const row of rows) {
        await sendPush(row.id, 'events', { title: `${event.name} birazdan başlıyor!`, body: `${event.preOpenMinutes} dakika içinde etkinlik alanı açılıyor.`, tag: `event-${event.id}`, url: '/' });
      }
    }
  }
  const pushInterval = PUSH_ENABLED ? setInterval(() => { runInactivityCheck().catch(() => {}); runEventReminderCheck().catch(() => {}); }, PUSH_CHECK_INTERVAL_MS) : null;
  const cookie = (token, age) => `nyxia_session=${token}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${age}${secure ? '; Secure' : ''}`;
  const accountDeleteRateLimit = makeRateLimiter(5);
  const isBlocked = (blocker, blocked) => !!db.prepare('SELECT 1 FROM user_blocks WHERE blocker=? AND blocked=?').get(blocker, blocked);
  const REPORT_REASONS = ['abuse', 'spam', 'inappropriate', 'cheating', 'other'];
  const BLOCK_LIMIT = 200;
  const REPORT_DAILY_LIMIT = 30;
  // Mağaza politikası (Apple 5.1.1(v), Google Play) uygulama içinden hesap
  // silmeyi şart koşuyor. Hesaba bağlı her satır tek işlemde siliniyor; klan
  // lideriyse liderlik sıradaki üyeye geçer, klanda kimse kalmazsa klan kalkar.
  // Sohbet mesajları hesap kimliği tutmadığı için karakter adlarıyla silinir.
  const deleteAccountData = (account) => {
    const id = account.id;
    db.exec('BEGIN IMMEDIATE');
    try {
      let characterNames = [];
      try {
        const row = db.prepare('SELECT data FROM backups WHERE account=?').get(id);
        characterNames = (JSON.parse(row?.data || '{}').characters || []).map(c => c?.nickname).filter(n => typeof n === 'string' && n);
      } catch { /* bozuk yedek silmeyi engellemesin */ }
      const clanIds = new Set([
        ...db.prepare('SELECT clan_id FROM clan_members WHERE account_id=?').all(id).map(r => r.clan_id),
        ...db.prepare('SELECT id FROM clans WHERE founder_account=?').all(id).map(r => r.id),
      ]);
      db.prepare('UPDATE clan_dungeon_state SET locked_by=NULL,locked_character=NULL,locked_by_name=NULL,locked_until=NULL WHERE locked_by=?').run(id);
      db.prepare('DELETE FROM clan_members WHERE account_id=?').run(id);
      for (const clanId of clanIds) {
        const remaining = db.prepare("SELECT account_id,character_key,role FROM clan_members WHERE clan_id=? ORDER BY CASE role WHEN 'leader' THEN 0 WHEN 'officer' THEN 1 ELSE 2 END, joined_at ASC").all(clanId);
        if (!remaining.length) {
          db.prepare('DELETE FROM clan_invites WHERE clan_id=?').run(clanId);
          db.prepare('DELETE FROM clan_dungeon_log WHERE clan_id=?').run(clanId);
          db.prepare('DELETE FROM clan_dungeon_state WHERE clan_id=?').run(clanId);
          db.prepare('DELETE FROM clans WHERE id=?').run(clanId);
          continue;
        }
        const leader = remaining[0];
        if (leader.role !== 'leader') db.prepare("UPDATE clan_members SET role='leader' WHERE account_id=? AND character_key=?").run(leader.account_id, leader.character_key);
        db.prepare('UPDATE clans SET founder_account=? WHERE id=? AND founder_account=?').run(leader.account_id, clanId, id);
      }
      for (const [sql, params] of [
        ['DELETE FROM clan_invites WHERE from_account=? OR to_account=?', [id, id]],
        ['DELETE FROM wheel_spins WHERE account_id=?', [id]],
        ['DELETE FROM economy_accounts WHERE account=?', [id]],
        ['DELETE FROM iap_purchases WHERE account=?', [id]],
        ['DELETE FROM entitlements WHERE account=?', [id]],
        ['DELETE FROM entitlement_seed WHERE account=?', [id]],
        ['DELETE FROM wallet_ledger WHERE account=?', [id]],
        ['DELETE FROM wallets WHERE account=?', [id]],
        ['DELETE FROM daily_login_claims WHERE account=?', [id]],
        ['DELETE FROM weekly_rank_claims WHERE account=?', [id]],
        ['DELETE FROM gm_accounts WHERE account=?', [id]],
        ['DELETE FROM user_blocks WHERE blocker=? OR blocked=?', [id, id]],
        ['DELETE FROM user_reports WHERE target=?', [id]],
        ['UPDATE user_reports SET reporter=NULL WHERE reporter=?', [id]],
        ['DELETE FROM chat_messages WHERE account_id=?', [id]],
        ['DELETE FROM clan_dungeon_attempts WHERE account_id=?', [id]],
        ['DELETE FROM clan_dungeon_log WHERE account_name=?', [account.name]],
        ['DELETE FROM friend_requests WHERE from_account=? OR to_account=?', [id, id]],
        ['DELETE FROM friendships WHERE account_a=? OR account_b=?', [id, id]],
        ['DELETE FROM direct_messages WHERE from_account=? OR to_account=?', [id, id]],
        ['DELETE FROM market_stalls WHERE account=?', [id]],
        ['DELETE FROM boss_contributions WHERE account=?', [id]],
        ['DELETE FROM boss_loot_claims WHERE account=?', [id]],
        ['DELETE FROM pending_grants WHERE account=?', [id]],
        ['DELETE FROM duel_pending WHERE account=?', [id]],
        ['DELETE FROM duel_history WHERE challenger=? OR opponent=?', [id, id]],
        ['DELETE FROM push_subscriptions WHERE account_id=?', [id]],
        ['DELETE FROM push_prefs WHERE account_id=?', [id]],
        ['DELETE FROM push_inactivity_sent WHERE account_id=?', [id]],
        ['DELETE FROM backup_history WHERE account=?', [id]],
        ['DELETE FROM backups WHERE account=?', [id]],
        ['DELETE FROM sessions WHERE account=?', [id]],
        ['DELETE FROM account_mutes WHERE account=?', [id]],
        ['DELETE FROM account_blocks WHERE account=?', [id]],
        ['DELETE FROM account_activity WHERE account=?', [id]],
        ['DELETE FROM admin_snapshots WHERE account=?', [id]],
        // Sohbet yazarı "Takma ad · Lv.N" biçiminde; seviye değiştiği için önek eşleşir.
        ...characterNames.map(name => ["DELETE FROM chat_messages WHERE author LIKE ? ESCAPE '\\'", [`${name.replace(/[\\%_]/g, '\\$&')} · Lv.%`]]),
        ['DELETE FROM accounts WHERE id=?', [id]],
      ]) db.prepare(sql).run(...params);
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  };
  const server = createServer(async (req, res) => {
    const send = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); res.end(JSON.stringify(body)); };
    try {
      const reqOrigin = req.headers.origin;
      if (reqOrigin && !allowedOrigins.has(reqOrigin)) throw fail(403, 'ORIGIN_DENIED');
      const nativeOrigin = !!reqOrigin && reqOrigin !== origin;
      if (reqOrigin) {
        res.setHeader('Access-Control-Allow-Origin', reqOrigin);
        if (!nativeOrigin) res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Vary', 'Origin');
      }
      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Character-Key, X-Native-Client, X-Client-Build, Authorization');
        return send(204, null);
      }
      const path = new URL(req.url, 'http://localhost').pathname;
      // Mağaza ödeme servisi (RevenueCat) tarayıcı değildir: Origin göndermez, kimliğini gizli anahtarla kanıtlar.
      const isWebhook = path === '/api/iap/revenuecat' && req.method === 'POST' && !reqOrigin;
      if (req.method !== 'GET' && req.method !== 'HEAD' && !isWebhook && (!allowedOrigins.has(reqOrigin) || !req.headers['content-type']?.startsWith('application/json'))) throw fail(403, 'INVALID_REQUEST_ORIGIN');
      if (isWebhook) return send(200, iap.handleRevenueCat(req.headers, await read(req)));
      if (!path.startsWith('/api/')) {
        if (!staticDir || req.method !== 'GET') throw fail(404, 'NOT_FOUND');
        return serveStatic(res, staticDir, path);
      }
      // En düşük istemci sürümü: eski kurallarla çalışan istemciler (ör. eski APK) sunucu ekonomisini bozmasın diye
      // reddedilir. Sağlık ucu, sahip paneli ve ödeme servisi (RevenueCat) bu denetimin dışındadır.
      if (path.startsWith('/api/') && path !== '/api/health' && path !== '/api/version' && !path.startsWith('/api/admin')) {
        const config = appConfig();
        const build = Number(req.headers['x-client-build']) || 0;
        if (config.minBuild > 0 && build < config.minBuild) return send(426, { error: 'CLIENT_OUTDATED', minBuild: config.minBuild, updateUrl: config.updateUrl || null });
      }
      if (path === '/api/version' && req.method === 'GET') { const config = appConfig(); return send(200, { minBuild: config.minBuild, updateUrl: config.updateUrl || null }); }
      if (path === '/api/health' && (req.method === 'GET' || req.method === 'HEAD')) return send(200, { ok: true, mode: 'account-backup', authoritative: false });
      if (['/api/register', '/api/login'].includes(path) && req.method === 'POST') {
        rateLimit(clientAddress(req));
        const body = await read(req);
        const name = typeof body?.name === 'string' ? body.name.trim().toLowerCase() : '';
        if (!/^[a-z0-9_]{3,24}$/.test(name) || typeof body?.password !== 'string' || body.password.length < 12 || body.password.length > 128) throw fail(400, 'INVALID_CREDENTIAL_FORMAT');
        let account = db.prepare('SELECT * FROM accounts WHERE name=?').get(name);
        if (path === '/api/register') {
          if (containsProfanityLoose(name)) throw fail(400, 'NAME_NOT_ALLOWED');
          const salt = randomBytes(16).toString('hex');
          const password = (await scrypt(body.password, salt, 64)).toString('hex');
          try { db.prepare('INSERT INTO accounts(name,salt,password) VALUES(?,?,?)').run(name, salt, password); }
          catch (error) { if (error.code?.startsWith('ERR_SQLITE') && db.prepare('SELECT id FROM accounts WHERE name=?').get(name)) throw fail(409, 'ACCOUNT_UNAVAILABLE'); throw error; }
          account = db.prepare('SELECT * FROM accounts WHERE name=?').get(name);
        } else {
          const candidate = await scrypt(body.password, account?.salt || 'invalid-account-salt', 64);
          if (!account || !timingSafeEqual(candidate, Buffer.from(account.password, 'hex'))) throw fail(401, 'INVALID_CREDENTIALS');
        }
        if(admin.blocked(account.id)) throw fail(403, 'ACCOUNT_BLOCKED');
        const token = randomBytes(32).toString('hex');
        db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now());
        db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash(token), account.id, Date.now() + 7 * 86400000);
        // Yerel uygulama (Capacitor) çerez kullanamaz; token yalnızca açıkça
        // native origin + X-Native-Client ile istenirse gövdede döner. Web
        // istemcisi token'ı hiç görmez (HttpOnly çerez korumasını bozmamak için).
        if (nativeOrigin && req.headers['x-native-client'] === '1') return send(200, { name: account.name, token });
        res.setHeader('Set-Cookie', cookie(token, 7 * 86400));
        return send(200, { name: account.name });
      }
      const bearerToken = /^Bearer ([a-f0-9]{64})$/.exec(req.headers.authorization || '')?.[1];
      // Native origin'den gelen istekte çerez yok sayılır: yalnızca Bearer geçerli.
      const cookieToken = nativeOrigin ? undefined : /(?:^|;\s*)nyxia_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1];
      const token = bearerToken || cookieToken;
      const account = token && db.prepare('SELECT accounts.id,accounts.name FROM sessions JOIN accounts ON accounts.id=sessions.account WHERE token=? AND expires>?').get(hash(token), Date.now());
      if (!account) throw fail(401, 'LOGIN_REQUIRED');
      if(admin.blocked(account.id)) throw fail(403,'ACCOUNT_BLOCKED');
      admin.touch(account.id);
      if(path.startsWith('/api/admin/')) return await admin.handle(req,path,account,send);
      if(path === '/api/drop-settings' && req.method==='GET')return send(200,admin.drops.get());
      if(req.method==='POST' && (path==='/api/chat/messages'||/^\/api\/social\/messages\/\d+$/.test(path)) && admin.muted(account.id))throw fail(403,'ACCOUNT_MUTED');
      if (path === '/api/me' && req.method === 'GET') return send(200, { id: account.id, name: account.name, gm: admin.isGm(account.id), economy: game.enabled(account.id) });
      if (path === '/api/logout' && req.method === 'POST') {
        db.prepare('DELETE FROM sessions WHERE token=?').run(hash(token));
        res.setHeader('Set-Cookie', cookie('', 0)); return send(200, { ok: true });
      }
      if (path === '/api/account/delete' && req.method === 'POST') {
        accountDeleteRateLimit(account.id);
        const body = await read(req);
        if (typeof body?.password !== 'string') throw fail(400, 'INVALID_CREDENTIAL_FORMAT');
        const full = db.prepare('SELECT salt,password FROM accounts WHERE id=?').get(account.id);
        const candidate = await scrypt(body.password, full.salt, 64);
        if (!timingSafeEqual(candidate, Buffer.from(full.password, 'hex'))) throw fail(403, 'WRONG_PASSWORD');
        if (db.prepare('SELECT 1 FROM panel_owner WHERE account=?').get(account.id)) throw fail(409, 'OWNER_CANNOT_DELETE');
        deleteAccountData(account);
        res.setHeader('Set-Cookie', cookie('', 0));
        return send(200, { ok: true });
      }
      if (path === '/api/wheel' && req.method === 'GET') return send(200, wheel.status(account.id));
      if (path === '/api/wheel/spin' && req.method === 'POST') { wheelRateLimit(account.id); return send(200, wheel.spin(account.id)); }
      if (path === '/api/wheel/claim' && req.method === 'POST') {
        wheelRateLimit(account.id);
        const body = await read(req).catch(() => ({}));
        const ck = validCharacterKey(body?.characterKey);
        // Premium ödülü hakkı sunucuda verilir: ödülün alınması ve hakkın yazılması tek işlemde.
        const result = wallet.atomic(() => {
          const pending = wheel.status(account.id).pending;
          const claimed = wheel.claim(account.id);
          if (!WHEEL_PREMIUM_PRIZES[pending]) return claimed;
          if (!ck) throw fail(400, 'INVALID_CHARACTER');
          entitlements.grantBoost(account.id, ck, pending, characterKey);
          return { ...claimed, entitlement: entitlements.snapshot(account.id, ck, characterKey) };
        });
        return send(200, result);
      }
      // Elmas kasası (sunucu otoritesi). Bakiye yalnızca bu uçlarla değişir; yedeğe
      // yazılan elmas sayısı dikkate alınmaz (bkz. wallet.clampBackup).
      if (path === '/api/wallet' && req.method === 'GET') {
        const queryKey = validCharacterKey(new URL(req.url, 'http://localhost').searchParams.get('characterKey'));
        return send(200, { diamonds: wallet.balance(account.id), ...(queryKey ? { entitlement: entitlements.snapshot(account.id, queryKey, characterKey) } : {}) });
      }
      if (path === '/api/wallet/spend' && req.method === 'POST') {
        walletRateLimit(account.id);
        const body = await read(req);
        const ref = typeof body?.ref === 'string' ? body.ref.slice(0, 60) : null;
        const kind = String(body?.kind);
        const key = body?.key == null ? null : String(body.key);
        const ck = validCharacterKey(body?.characterKey);
        const now = Date.now();
        const needCharacter = () => { if (!ck) throw fail(400, 'INVALID_CHARACTER'); return ck; };
        let hooks = {};
        if (kind === 'premium') {
          hooks = { check: () => entitlements.checkPremium(account.id, needCharacter(), key, characterKey, now), grant: () => { entitlements.grantPremium(account.id, ck, key, 'purchase', now); return entitlements.snapshot(account.id, ck, characterKey, now); } };
        } else if (kind === 'dye') {
          hooks = { check: () => entitlements.checkNotOwned(account.id, needCharacter(), 'dye', key, characterKey, now), grant: () => { entitlements.grantOwned(account.id, ck, 'dye', key, 'purchase', now); return entitlements.snapshot(account.id, ck, characterKey, now); } };
        } else if (kind === 'avatarCosmetic') {
          const match = /^(avatar|frame):([\w-]{1,40})$/.exec(key || '');
          if (!match) throw fail(400, 'INVALID_PURCHASE');
          hooks = { check: () => entitlements.checkNotOwned(account.id, needCharacter(), match[1], match[2], characterKey, now), grant: () => { entitlements.grantOwned(account.id, ck, match[1], match[2], 'purchase', now); return entitlements.snapshot(account.id, ck, characterKey, now); } };
        } else if (kind === 'slotUnlock') {
          hooks = { check: () => entitlements.checkSlot(account.id, characterKey, now), grant: () => { entitlements.grantSlot(account.id, 'purchase', now); return entitlements.snapshot(account.id, ck || '', characterKey, now); } };
        }
        return send(200, wallet.spend(account.id, kind, key, ref, now, hooks));
      }
      // Ekonomi eylemleri (sunucu otoritesi, Faz 2). Bkz. src/game/actions.js.
      if (path === '/api/game/act' && req.method === 'POST') {
        actRateLimit(account.id);
        const body = await read(req);
        const ck = validCharacterKey(body?.characterKey);
        if (!ck) throw fail(400, 'INVALID_CHARACTER');
        return send(200, game.act(account.id, ck, String(body?.type), body?.payload ?? {}));
      }
      // GM/sahip: karaktere premium verir (sohbet komutu /premium). Elmas harcamaz.
      if (path === '/api/entitlements/gm-premium' && req.method === 'POST') {
        walletRateLimit(account.id);
        if (!admin.isGm(account.id)) throw fail(403, 'GM_ONLY');
        const body = await read(req);
        const ck = validCharacterKey(body?.characterKey);
        if (!ck || !['mythic', 'apex'].includes(body?.tier)) throw fail(400, 'INVALID_PURCHASE');
        const result = wallet.atomic(() => { entitlements.ensure(account.id, characterKey); entitlements.grantPremium(account.id, ck, body.tier, 'gm', Date.now()); return entitlements.snapshot(account.id, ck, characterKey); });
        return send(200, { entitlement: result });
      }
      if (path === '/api/wallet/daily-login' && req.method === 'POST') {
        walletRateLimit(account.id);
        const body = await read(req);
        const characterKey = validCharacterKey(body?.characterKey);
        if (!characterKey) throw fail(400, 'INVALID_CHARACTER');
        return send(200, wallet.dailyLogin(account.id, characterKey));
      }
      if (path === '/api/wallet/weekly-rank' && req.method === 'POST') {
        walletRateLimit(account.id);
        const body = await read(req);
        const characterKey = validCharacterKey(body?.characterKey);
        if (!characterKey) throw fail(400, 'INVALID_CHARACTER');
        if (game.enabled(account.id)) {
          // Sıra ve hafta istemciden değil, sunucunun hafta geçişinde (week/rollover) yazdığı bekleyen talepten gelir.
          const stored = db.prepare('SELECT revision,data FROM backups WHERE account=?').get(account.id);
          const data = stored ? JSON.parse(stored.data) : null;
          const index = (data?.characters || []).findIndex((c, i) => c && characterKeyOf(c, i) === characterKey);
          const pending = index >= 0 ? data.characters[index].pendingWeeklyClaim : null;
          if (!pending) return send(200, { diamondsAwarded: 0, diamonds: wallet.balance(account.id), noPending: true });
          const paid = wallet.weeklyRank(account.id, characterKey, pending.weekId, pending.rank);
          delete data.characters[index].pendingWeeklyClaim;
          db.prepare('UPDATE backups SET revision=?,data=?,updated=? WHERE account=?').run(stored.revision + 1, JSON.stringify(data), Date.now(), account.id);
          return send(200, paid);
        }
        return send(200, wallet.weeklyRank(account.id, characterKey, body?.weekId, body?.rank === null ? null : Number(body?.rank)));
      }
      if (path === '/api/wallet/gm-grant' && req.method === 'POST') {
        walletRateLimit(account.id);
        if (!admin.isGm(account.id)) throw fail(403, 'GM_ONLY');
        const body = await read(req);
        const amount = Number(body?.amount);
        if (!Number.isSafeInteger(amount) || amount < 1 || amount > 1_000_000) throw fail(400, 'INVALID_AMOUNT');
        return send(200, { diamonds: wallet.credit(account.id, amount, 'gm-grant', account.name) });
      }
      if (path === '/api/backup' && req.method === 'GET') {
        const row = db.prepare('SELECT * FROM backups WHERE account=?').get(account.id);
        const stored = row ? JSON.parse(row.data) : null;
        return send(200, { revision: row?.revision || 0, data: stored ? entitlements.pin(account.id, wallet.clampBackup(account.id, stored), characterKey) : null, trusted: false });
      }
      if (path === '/api/backup' && req.method === 'PUT') {
        const body = await read(req);
        if (!Number.isSafeInteger(body?.revision) || body.revision < 0 || !body.data || typeof body.data !== 'object' || !Array.isArray(body.data.characters) || body.data.characters.length !== 3) throw fail(400, 'INVALID_BACKUP');
        // No await between version check and commit: conflicting clients cannot overwrite silently.
        db.exec('BEGIN IMMEDIATE');
        try {
          const current = db.prepare('SELECT revision FROM backups WHERE account=?').get(account.id)?.revision || 0;
          if (current !== body.revision) throw fail(409, 'BACKUP_CONFLICT');
          const keys=body.data.characters.map((c,i)=>c?characterKey(c,i):null).filter(Boolean);
          if(new Set(keys).size!==keys.length)throw fail(400,'DUPLICATE_CHARACTER_ID');
          for(const member of db.prepare('SELECT character_key FROM clan_members WHERE account_id=?').all(account.id)){
            if(!keys.includes(member.character_key))throw fail(409,'LEAVE_CLAN_BEFORE_DELETING_CHARACTER');
          }
          const revision = current + 1, now = Date.now();
          wallet.clampBackup(account.id, body.data);
          entitlements.pin(account.id, body.data, characterKey);
          game.pin(account.id, body.data);
          const data = JSON.stringify(body.data);
          db.prepare('INSERT INTO backup_history VALUES(?,?,?,?)').run(account.id, revision, data, now);
          db.prepare('INSERT OR REPLACE INTO backups VALUES(?,?,?,?)').run(account.id, revision, data, now);
          db.prepare('DELETE FROM backup_history WHERE account=? AND revision<=?').run(account.id, revision - 20);
          db.exec('COMMIT'); return send(200, { revision, trusted: false });
        } catch (error) { db.exec('ROLLBACK'); throw error; }
      }
      if (path === '/api/chat/messages' && req.method === 'GET') {
        // Engellediğim oyuncuların mesajları sunucuda süzülür.
        const rows = db.prepare('SELECT id,author,text,is_gm,created_at,avatar_id,frame_id,account_id FROM chat_messages WHERE account_id IS NULL OR account_id NOT IN (SELECT blocked FROM user_blocks WHERE blocker=?) ORDER BY id DESC LIMIT 100').all(account.id).reverse();
        return send(200, rows.map(r => ({ id: r.id, author: r.author, text: r.text, isGM: !!r.is_gm, createdAt: r.created_at, avatarId:r.avatar_id,frameId:r.frame_id||null, mine: r.account_id === account.id })));
      }
      if (path === '/api/chat/messages' && req.method === 'POST') {
        chatRateLimit(account.id);
        const body = await read(req);
        const author = typeof body?.author === 'string' ? maskProfanity(body.author.trim().slice(0, 40)) : '';
        const text = typeof body?.text === 'string' ? maskProfanity(body.text.trim().slice(0, 500)) : '';
        if (!author || !text) throw fail(400, 'INVALID_MESSAGE');
        // GM rozeti istemcinin söylediğine değil sunucudaki hesap yetkisine bağlı.
        const isGm = admin.isGm(account.id);
        const createdAt = Date.now();
        const avatarId=body.avatarId??'human-warrior';
        if(!validPlayerAvatar(avatarId))throw fail(400,'INVALID_AVATAR');
        const frameId=body.frameId??null;
        if(!validAvatarFrame(frameId))throw fail(400,'INVALID_AVATAR');
        db.prepare('INSERT INTO chat_messages(author,text,is_gm,created_at,avatar_id,frame_id,account_id) VALUES(?,?,?,?,?,?,?)').run(author, text, isGm ? 1 : 0, createdAt,avatarId,frameId,account.id);
        // Kullanıcı isteği: sohbet kalıcı bir arşiv değil — 200 mesajlık
        // tavanın yanı sıra artık zamana göre de temizleniyor (bkz.
        // data/social.js#CHAT_MESSAGE_TTL_MS), sistemi yormasın diye.
        db.prepare('DELETE FROM chat_messages WHERE created_at < ?').run(Date.now() - CHAT_MESSAGE_TTL_MS);
        const id = db.prepare('SELECT last_insert_rowid() AS id').get().id;
        db.prepare('DELETE FROM chat_messages WHERE id <= (SELECT MAX(id) - 200 FROM chat_messages)').run();
        return send(200, { id, author, text, isGM: isGm, createdAt,avatarId,frameId });
      }
      // Faz 3 — paylaşımlı pazar. Hesap başına tek tezgah (bkz. market_stalls'ın
      // PRIMARY KEY'i). `sellerId` = market_stalls.account = accounts.id: takma
      // ad (nickname) hesaplar arası benzersiz DEĞİL, bu yüzden satın alma
      // isteğinde satıcıyı bulmak için isim değil bu opak id kullanılıyor.
      if (path === '/api/market/stall' && req.method === 'GET') {
        const row = db.prepare('SELECT * FROM market_stalls WHERE account=?').get(account.id);
        if (!row) return send(200, { stall: null });
        return send(200, { stall: { sellerName: row.seller_name, items: JSON.parse(row.items), listedAt: row.listed_at, durationHours: row.duration_hours, active: stallActive(row, Date.now()) } });
      }
      if (path === '/api/market/stalls' && req.method === 'GET') {
        const now = Date.now();
        const rows = db.prepare('SELECT * FROM market_stalls WHERE account != ?').all(account.id);
        return send(200, { stalls: rows.filter(r => stallActive(r, now)).map(r => ({ sellerId: r.account, sellerName: r.seller_name, items: JSON.parse(r.items) })) });
      }
      if (path === '/api/market/stall' && req.method === 'POST') {
        if (game.enabled(account.id)) throw fail(409, 'USE_GAME_ACT');
        const body = await read(req);
        const sellerName = typeof body?.sellerName === 'string' ? body.sellerName.trim().slice(0, 24) : '';
        const durationHours = Number(body?.durationHours);
        if (!sellerName || !MARKET_DURATIONS_HOURS.has(durationHours)) throw fail(400, 'INVALID_STALL');
        const existing = db.prepare('SELECT * FROM market_stalls WHERE account=?').get(account.id);
        if (existing) throw fail(409, stallActive(existing, Date.now()) ? 'STALL_ALREADY_OPEN' : 'STALL_EXPIRED_MUST_CLOSE');
        const listedAt = Date.now();
        db.prepare('INSERT INTO market_stalls(account,seller_name,items,listed_at,duration_hours) VALUES(?,?,?,?,?)').run(account.id, sellerName, '[]', listedAt, durationHours);
        return send(200, { stall: { sellerName, items: [], listedAt, durationHours, active: true } });
      }
      if (path === '/api/market/stall/items' && req.method === 'POST') {
        if (game.enabled(account.id)) throw fail(409, 'USE_GAME_ACT');
        const body = await read(req);
        if (body?.item?.noTrade || Object.values(FIRST_PURCHASE_WEAPONS).some(w=>w.name===body?.item?.name)) return send(400, {error:'ITEM_BOUND'});
        const price = Number(body?.price);
        if (!body?.item || typeof body.item !== 'object' || !Number.isSafeInteger(price) || price <= 0 || price > MARKET_MAX_PRICE) throw fail(400, 'INVALID_LISTING');
        db.exec('BEGIN IMMEDIATE');
        try {
          const row = db.prepare('SELECT * FROM market_stalls WHERE account=?').get(account.id);
          if (!row || !stallActive(row, Date.now())) throw fail(400, 'NO_OPEN_STALL');
          const items = JSON.parse(row.items);
          if (items.length >= MARKET_STALL_MAX_ITEMS) throw fail(400, 'STALL_FULL');
          items.push({ id: randomBytes(8).toString('hex'), item: body.item, price });
          db.prepare('UPDATE market_stalls SET items=? WHERE account=?').run(JSON.stringify(items), account.id);
          db.exec('COMMIT');
          return send(200, { stall: { sellerName: row.seller_name, items, listedAt: row.listed_at, durationHours: row.duration_hours, active: true } });
        } catch (error) { db.exec('ROLLBACK'); throw error; }
      }
      // Hem "erken kapat" (tüm id'ler) hem "süresi dolmuş tezgahtan geri al"
      // (sadece depoya sığan id'ler) burayı kullanır — istemci hangi id'lerin
      // gerçekten yerleştirildiğine kendi karar verip gönderiyor, sığmayanlar
      // tezgahta kalmaya devam eder (bkz. MarketTab.jsx#distributeReclaimedItems).
      if (path === '/api/market/stall/items' && req.method === 'DELETE') {
        if (game.enabled(account.id)) throw fail(409, 'USE_GAME_ACT');
        const body = await read(req);
        const ids = new Set(Array.isArray(body?.itemIds) ? body.itemIds : []);
        db.exec('BEGIN IMMEDIATE');
        try {
          const row = db.prepare('SELECT * FROM market_stalls WHERE account=?').get(account.id);
          if (!row) { db.exec('COMMIT'); return send(200, { removed: [] }); }
          const items = JSON.parse(row.items);
          const removed = items.filter(entry => ids.has(entry.id));
          const remaining = items.filter(entry => !ids.has(entry.id));
          if (remaining.length === 0) db.prepare('DELETE FROM market_stalls WHERE account=?').run(account.id);
          else db.prepare('UPDATE market_stalls SET items=? WHERE account=?').run(JSON.stringify(remaining), account.id);
          db.exec('COMMIT');
          return send(200, { removed });
        } catch (error) { db.exec('ROLLBACK'); throw error; }
      }
      // Satın alma: eşya transferi ATOMİK (aynı eşya iki kişiye satılamaz,
      // kaybolmaz). Ödeme satıcıya SUNUCUDA, doğrudan onun yedeğindeki
      // bankGold'a ekleniyor — satıcı o an bağlı olmayabilir, ödemenin
      // gerçekleşmesi için istemcisinin açık olmasına bağlı KALINAMAZ.
      // Alıcının altın düşüşü ise (oyundaki HER ŞEY gibi — canavar öldürme,
      // iksir alma, GM komutları...) hâlâ istemci tarafında; dosyanın en
      // üstündeki genel nottaki güven sınırıyla aynı seviyede (authoritative
      // olmayan bir istemci teorik olarak ödemeden alabilir) — tam
      // sunucu-taraflı ekonomi Faz 4/5'in işi.
      if (path === '/api/market/buy' && req.method === 'POST') {
        if (game.enabled(account.id)) throw fail(409, 'USE_GAME_ACT');
        const body = await read(req);
        const sellerId = Number(body?.sellerId);
        const itemId = typeof body?.itemId === 'string' ? body.itemId : '';
        if (!Number.isSafeInteger(sellerId) || !itemId) throw fail(400, 'INVALID_PURCHASE');
        if (sellerId === account.id) throw fail(400, 'CANNOT_BUY_OWN_STALL');
        db.exec('BEGIN IMMEDIATE');
        try {
          const stallRow = db.prepare('SELECT * FROM market_stalls WHERE account=?').get(sellerId);
          if (!stallRow || !stallActive(stallRow, Date.now())) throw fail(409, 'LISTING_GONE');
          const items = JSON.parse(stallRow.items);
          const idx = items.findIndex(entry => entry.id === itemId);
          if (idx === -1) throw fail(409, 'LISTING_GONE');
          const [bought] = items.splice(idx, 1);
          if (items.length === 0) db.prepare('DELETE FROM market_stalls WHERE account=?').run(sellerId);
          else db.prepare('UPDATE market_stalls SET items=? WHERE account=?').run(JSON.stringify(items), sellerId);
          const sellerBackup = db.prepare('SELECT * FROM backups WHERE account=?').get(sellerId);
          if (sellerBackup) {
            const data = JSON.parse(sellerBackup.data);
            data.bankGold = Math.min(2000000000, (data.bankGold || 0) + bought.price);
            const revision = sellerBackup.revision + 1, now = Date.now(), json = JSON.stringify(data);
            db.prepare('INSERT INTO backup_history VALUES(?,?,?,?)').run(sellerId, revision, json, now);
            db.prepare('INSERT OR REPLACE INTO backups VALUES(?,?,?,?)').run(sellerId, revision, json, now);
            db.prepare('DELETE FROM backup_history WHERE account=? AND revision<=?').run(sellerId, revision - 20);
          }
          db.exec('COMMIT');
          return send(200, { item: bought.item, price: bought.price });
        } catch (error) { db.exec('ROLLBACK'); throw error; }
      }
      // Faz 4 — paylaşımlı Dünya Canavarı. Faz geçişleri (dormant/gathering/
      // countdown/active/gone) istemci tarafında zaten hesaplanıyor (bkz.
      // utils/warzoneBoss.js#bossSchedule, WarzoneTab.jsx — burası da AYNI
      // saf fonksiyonu kullanıyor, iki ayrı takvim birbirinden sapmıyor).
      // Sunucunun tuttuğu tek şey: "active" fazdaki bosslarda PAYLAŞILAN can
      // ve katkı miktarları. Hasar İSTEMCİDE hesaplanıyor (mevcut formül
      // değişmedi) — sunucu sadece akla yatkın bir üst sınırla (bkz.
      // BOSS_HIT_CAP_RATIO) körü körüne kabul etmiyor; bu TAM anti-hile
      // değil (gerçek sunucu-taraflı hasar hesaplaması, oyuncunun gerçek
      // ekipman/istatistiklerinin sunucuda da bilinmesini gerektirir — o,
      // Faz 5'in işi), sadece en bariz istismarı (tek vuruşta boss'u
      // silme gibi) engelleyen bir akıl sağlığı sınırı.
      if (path === '/api/warzone/bosses' && req.method === 'GET') {
        const now = Date.now();
        const result = {};
        for (const boss of WARZONE_BOSSES) {
          const sched = bossSchedule(boss, now);
          if (sched.phase !== 'active') continue;
          let fight = db.prepare('SELECT * FROM boss_fights WHERE boss_id=? AND spawn_at=?').get(boss.id, sched.spawnAt);
          if (!fight) {
            db.prepare('INSERT INTO boss_fights(boss_id,spawn_at,hp,resolved) VALUES(?,?,?,0)').run(boss.id, sched.spawnAt, boss.hp);
            fight = { boss_id: boss.id, spawn_at: sched.spawnAt, hp: boss.hp, resolved: 0 };
          }
          const myDamage = db.prepare('SELECT damage FROM boss_contributions WHERE boss_id=? AND spawn_at=? AND account=?').get(boss.id, sched.spawnAt, account.id)?.damage || 0;
          const totalDamage = db.prepare('SELECT COALESCE(SUM(damage),0) AS total FROM boss_contributions WHERE boss_id=? AND spawn_at=?').get(boss.id, sched.spawnAt).total;
          result[boss.id] = { hp: fight.hp, maxHp: boss.hp, resolved: !!fight.resolved, myDamage, totalDamage };
        }
        return send(200, { bosses: result });
      }
      const attackMatch = path.match(/^\/api\/warzone\/boss\/([a-z0-9_]+)\/attack$/);
      if (attackMatch && req.method === 'POST') {
        bossAttackRateLimit(account.id);
        const boss = WARZONE_BOSSES.find(b => b.id === attackMatch[1]);
        if (!boss) throw fail(404, 'NOT_FOUND');
        const sched = bossSchedule(boss, Date.now());
        if (sched.phase !== 'active') throw fail(409, 'BOSS_NOT_ACTIVE');
        const body = await read(req);
        // Sunucu ekonomisinde hasarı istemci söylemez: eylem (saldır/beceri) bildirilir, vuruşu sunucu motoru hesaplar.
        const engine = game.enabled(account.id);
        let damage = Number(body?.damage);
        if (!engine) {
          const BOSS_HIT_CAP_RATIO = 0.5; // bkz. yukarıdaki genel not — tek vuruş boss canının yarısını aşamaz
          if (!Number.isSafeInteger(damage) || damage <= 0 || damage > boss.hp * BOSS_HIT_CAP_RATIO) throw fail(400, 'INVALID_DAMAGE');
          checkSharedHit(account.id, boss.def, damage);
        } else {
          const last = lastSharedHit.get(account.id) || 0;
          if (Date.now() - last < 300) throw fail(429, 'TOO_FAST');
          lastSharedHit.set(account.id, Date.now());
        }
        db.exec('BEGIN IMMEDIATE');
        try {
          let fight = db.prepare('SELECT * FROM boss_fights WHERE boss_id=? AND spawn_at=?').get(boss.id, sched.spawnAt);
          if (!fight) { db.prepare('INSERT INTO boss_fights(boss_id,spawn_at,hp,resolved) VALUES(?,?,?,0)').run(boss.id, sched.spawnAt, boss.hp); fight = { hp: boss.hp, resolved: 0 }; }
          if (fight.resolved) throw fail(409, 'BOSS_ALREADY_DEFEATED');
          let shared = null;
          if (engine) {
            const ck = validCharacterKey(body?.characterKey);
            if (!ck) throw fail(400, 'INVALID_CHARACTER');
            shared = game.sharedAttack(account.id, ck, `boss:${boss.id}`, sched.spawnAt, { hp: boss.hp, atk: boss.atk, def: boss.def }, fight.hp, body?.action);
            if (!shared.result.ok) { db.exec('ROLLBACK'); return send(200, { ok: false, reason: shared.result.reason, hp: fight.hp, resolved: false }); }
            damage = shared.damage;
          }
          const hp = Math.max(0, fight.hp - (damage > 0 ? damage : 0));
          const resolved = hp <= 0 && damage > 0;
          db.prepare('UPDATE boss_fights SET hp=?, resolved=? WHERE boss_id=? AND spawn_at=?').run(hp, resolved ? 1 : 0, boss.id, sched.spawnAt);
          const prevMine = db.prepare('SELECT damage FROM boss_contributions WHERE boss_id=? AND spawn_at=? AND account=?').get(boss.id, sched.spawnAt, account.id)?.damage || 0;
          db.prepare('INSERT INTO boss_contributions(boss_id,spawn_at,account,damage) VALUES(?,?,?,?) ON CONFLICT(boss_id,spawn_at,account) DO UPDATE SET damage=excluded.damage').run(boss.id, sched.spawnAt, account.id, prevMine + damage);
          let wonByMe = false;
          if (resolved) {
            // Kullanıcı isteği (bot dönemimden kalan ilke, gerçek oyunculara
            // taşındı): "Düşen drop random olacak. Damage atan kişiler
            // arasında en yüksek damage'i atan kişi biraz daha şanslı
            // olacak." — hasarla orantılı ağırlıklı çekiliş, kesin değil.
            const contributions = db.prepare('SELECT account, damage FROM boss_contributions WHERE boss_id=? AND spawn_at=?').all(boss.id, sched.spawnAt);
            const total = contributions.reduce((sum, c) => sum + c.damage, 0);
            let roll = Math.random() * total, winner = contributions[contributions.length - 1]?.account;
            for (const c of contributions) { roll -= c.damage; if (roll <= 0) { winner = c.account; break; } }
            if (winner) {
              db.prepare('INSERT INTO boss_loot_claims(account,boss_id,created_at) VALUES(?,?,?)').run(winner, boss.id, Date.now());
              wonByMe = winner === account.id;
            }
          }
          db.exec('COMMIT');
          return send(200, { hp, resolved, wonByMe, ...(shared ? { ok: true, shared: { result: shared.result, patch: shared.patch, revision: shared.revision } } : {}) });
        } catch (error) { db.exec('ROLLBACK'); throw error; }
      }
      if (path === '/api/warzone/loot-claims' && req.method === 'GET') {
        const rows = db.prepare('SELECT id, boss_id, created_at FROM boss_loot_claims WHERE account=?').all(account.id);
        return send(200, { claims: rows.map(r => ({ id: r.id, bossId: r.boss_id, createdAt: r.created_at })) });
      }
      const claimMatch = path.match(/^\/api\/warzone\/loot-claims\/(\d+)\/claim$/);
      if (claimMatch && req.method === 'POST') {
        const result = db.prepare('DELETE FROM boss_loot_claims WHERE id=? AND account=?').run(Number(claimMatch[1]), account.id);
        if (result.changes === 0) throw fail(404, 'CLAIM_NOT_FOUND');
        return send(200, { ok: true });
      }
      // Faz 5 — gerçek PvP. Duello hesaplaması (bkz. utils/duelEngine.js)
      // saf/deterministik ama React ikonlarına kadar uzanan geniş bir bağımlı
      // ağacı var (bkz. data/classes.js#icon) — sunucuda çalıştırmak için o
      // ağacı ayıklamak bu fazın kapsamını çok büyütürdü. Bunun yerine
      // ASENKRON bir model: iki oyuncu aynı anda çevrimiçi olmak ZORUNDA
      // değil — sunucu rastgele GERÇEK bir başka hesabın en son senkronlanmış
      // karakter anlık görüntüsünü (bkz. backups tablosu) verir, düello o
      // anlık görüntüye karşı İSTEMCİDE (mevcut deterministic motor, değişmedi)
      // koşulur. Rakip hiçbir şey kaybetmez/kazanmaz (sadece bir hedef),
      // National Point ödülü/cezası SADECE meydan okuyanın kendi istemcisinde
      // uygulanır — oyundaki her ekonomi hareketiyle aynı güven seviyesi.
      if (path === '/api/warzone/duel/opponent' && req.method === 'GET') {
        duelRateLimit(account.id);
        if (game.enabled(account.id)) throw fail(409, 'USE_GAME_ACT');
        const level = Number(new URL(req.url, 'http://localhost').searchParams.get('level')) || 1;
        const picked = pickDuelOpponent(account.id, level);
        if (!picked) return send(200, { opponent: null });
        return send(200, picked);
      }
      if (path === '/api/warzone/duel/result' && req.method === 'POST') {
        duelRateLimit(account.id);
        if (game.enabled(account.id)) throw fail(409, 'USE_GAME_ACT');
        const body = await read(req);
        const opponentAccountId = Number(body?.opponentAccountId);
        const winner = ['me', 'opponent', 'draw'].includes(body?.winner) ? body.winner : null;
        if (!Number.isSafeInteger(opponentAccountId) || !winner) throw fail(400, 'INVALID_DUEL_RESULT');
        db.prepare('INSERT INTO duel_history(challenger,opponent,winner,created_at) VALUES(?,?,?,?)').run(account.id, opponentAccountId, winner, Date.now());
        return send(200, { ok: true });
      }
      // Faz 6 — arkadaş listesi. Hesap adı (accounts.name) ile hedefleniyor,
      // karakter takma adıyla DEĞİL — takma ad hesaplar arası benzersiz
      // değil (bkz. yukarıdaki market notu), hesap adı ise öyle.
      const friendCount = id => db.prepare('SELECT COUNT(*) AS c FROM friendships WHERE account_a=? OR account_b=?').get(id, id).c;
      // Bir hesabın "ana karakteri" — düello rakibi/klan üyesi seçiminde
      // kullanılan AYNI sezgi (en yüksek seviyeli karakter), tutarlılık için
      // burada da tekrarlanıyor (bkz. /api/warzone/duel/opponent, /api/clan/mine).
      const mainCharacterOf = row => {
        if (!row?.data) return null;
        try {
          const parsed = JSON.parse(row.data);
          const chars = Array.isArray(parsed?.characters) ? parsed.characters.filter(Boolean) : [];
          return chars.reduce((best, c) => (!best || (c.level || 0) > (best.level || 0) ? c : best), null);
        } catch { return null; }
      };
      if (path === '/api/social/friends' && req.method === 'GET') {
        const friendRows = db.prepare(`SELECT accounts.id AS id, accounts.name AS name FROM friendships
          JOIN accounts ON accounts.id = CASE WHEN friendships.account_a=? THEN friendships.account_b ELSE friendships.account_a END
          WHERE friendships.account_a=? OR friendships.account_b=?`).all(account.id, account.id, account.id);
        const incoming = db.prepare('SELECT friend_requests.id AS id, accounts.id AS fromId, accounts.name AS fromName, friend_requests.created_at AS createdAt FROM friend_requests JOIN accounts ON accounts.id=friend_requests.from_account WHERE friend_requests.to_account=?').all(account.id);
        const outgoing = db.prepare('SELECT friend_requests.id AS id, accounts.id AS toId, accounts.name AS toName, friend_requests.created_at AS createdAt FROM friend_requests JOIN accounts ON accounts.id=friend_requests.to_account WHERE friend_requests.from_account=?').all(account.id);
        // Kullanıcı isteği: "arkadaşlarımızla konuşmalarımızdan gelen
        // mesajların bildirimi gözüksün" — her arkadaşın bana EN SON ne
        // zaman mesaj attığı (benim ona attığım değil) tek sorguda
        // toplanıyor; "okundu" durumu istemcide tutuluyor (bkz. Hub.jsx'in
        // chatSeenCount ile aynı desen — sayfa yenilenince sıfırlanır,
        // kritik veri değil).
        const lastFromThem = new Map(
          db.prepare('SELECT from_account AS id, MAX(created_at) AS lastAt FROM direct_messages WHERE to_account=? GROUP BY from_account').all(account.id)
            .map(r => [r.id, r.lastAt])
        );
        return send(200, {
          friends: friendRows.map(r => ({ accountId: r.id, name: r.name, lastMessageAt: lastFromThem.get(r.id) || null })),
          incoming: incoming.map(r => ({ id: r.id, fromAccountId: r.fromId, fromName: r.fromName, createdAt: r.createdAt })),
          outgoing: outgoing.map(r => ({ id: r.id, toAccountId: r.toId, toName: r.toName, createdAt: r.createdAt })),
        });
      }
      // Arkadaşa VS (dostane düello). Rakip, arkadaşın en yüksek seviyeli karakterinin
      // en son senkronlanmış anlık görüntüsüdür (arkadaş çevrimdışı olabilir). Sonuç
      // kimseye ödül/ceza yazmaz; hesap istemcide yapılır (bkz. utils/duelEngine.js).
      // Yalnızca düello için gereken alanlar döner — envanter, altın, banka gibi
      // özel veriler arkadaşa bile verilmez.
      const friendDuelMatch = path.match(/^\/api\/social\/friends\/(\d+)\/duel$/);
      if (friendDuelMatch && req.method === 'GET') {
        duelRateLimit(account.id);
        const friendId = Number(friendDuelMatch[1]);
        const [low, high] = [Math.min(account.id, friendId), Math.max(account.id, friendId)];
        const isFriend = db.prepare('SELECT 1 FROM friendships WHERE (account_a=? AND account_b=?) OR (account_a=? AND account_b=?)').get(low, high, high, low);
        if (!isFriend) throw fail(403, 'NOT_FRIENDS');
        if (db.prepare('SELECT 1 FROM user_blocks WHERE (blocker=? AND blocked=?) OR (blocker=? AND blocked=?)').get(account.id, friendId, friendId, account.id)) throw fail(403, 'USER_BLOCKED');
        const row = db.prepare('SELECT backups.data AS data, accounts.name AS accountName FROM backups JOIN accounts ON accounts.id = backups.account WHERE backups.account=?').get(friendId);
        const character = mainCharacterOf(row);
        if (!character) throw fail(404, 'NO_CHARACTER');
        const seed = randomBytes(4).readUInt32BE(0) || 1;
        return send(200, { friendName: character.nickname || row.accountName, opponent: duelSnapshot(character), seed });
      }
      // Kullanıcı isteği: "arkadaş önerilerinin gözüktüğü bir sistem olsun."

      // Önce ortak arkadaş sayısına göre sıralanmış aday (arkadaşının
      // arkadaşı) listesi, yetmezse gerçekten oynanmış (backup'ı olan) en
      // son aktif hesaplarla dolduruluyor — hiçbir zaman zaten arkadaş
      // olunan, bekleyen isteği olan ya da kendisi olan biri önerilmiyor.
      if (path === '/api/social/suggestions' && req.method === 'GET') {
        const friendIds = db.prepare('SELECT account_a,account_b FROM friendships WHERE account_a=? OR account_b=?').all(account.id, account.id)
          .map(r => (r.account_a === account.id ? r.account_b : r.account_a));
        const excludeIds = new Set([account.id, ...friendIds]);
        for (const r of db.prepare('SELECT blocker,blocked FROM user_blocks WHERE blocker=? OR blocked=?').all(account.id, account.id)) {
          excludeIds.add(r.blocker); excludeIds.add(r.blocked);
        }
        for (const r of db.prepare('SELECT from_account,to_account FROM friend_requests WHERE from_account=? OR to_account=?').all(account.id, account.id)) {
          excludeIds.add(r.from_account); excludeIds.add(r.to_account);
        }
        const mutualCounts = new Map();
        if (friendIds.length) {
          const placeholders = friendIds.map(() => '?').join(',');
          const rows = db.prepare(`SELECT account_a,account_b FROM friendships WHERE account_a IN (${placeholders}) OR account_b IN (${placeholders})`).all(...friendIds, ...friendIds);
          for (const r of rows) {
            for (const candidate of [r.account_a, r.account_b]) {
              if (excludeIds.has(candidate)) continue;
              mutualCounts.set(candidate, (mutualCounts.get(candidate) || 0) + 1);
            }
          }
        }
        const SUGGESTION_LIMIT = 10;
        let candidateIds = [...mutualCounts.entries()].sort((x, y) => y[1] - x[1]).map(([id]) => id);
        if (candidateIds.length < SUGGESTION_LIMIT) {
          const have = new Set([...excludeIds, ...candidateIds]);
          const filler = db.prepare('SELECT backups.account AS id FROM backups ORDER BY backups.updated DESC LIMIT 60').all()
            .map(r => r.id).filter(id => !have.has(id));
          candidateIds = [...candidateIds, ...filler];
        }
        candidateIds = candidateIds.slice(0, SUGGESTION_LIMIT);
        const result = candidateIds.map(id => {
          const accRow = db.prepare('SELECT name FROM accounts WHERE id=?').get(id);
          const main = mainCharacterOf(db.prepare('SELECT data FROM backups WHERE account=?').get(id));
          return {
            accountId: id, accountName: accRow.name, name: main?.nickname || accRow.name,
            avatarId: playerAvatarId(main), cls: main?.class || null, level: main?.level || 0,
            mutualFriends: mutualCounts.get(id) || 0,
          };
        });
        return send(200, result);
      }
      // İki yönlü bekleyen istek varsa (B zaten A'ya istek göndermiş) yeni bir
      // bekleyen istek daha açmak yerine doğrudan arkadaşlığı kur — Discord
      // tarzı "karşılıklı istek otomatik kabul" davranışı.
      if (path === '/api/social/friends/request' && req.method === 'POST') {
        socialRateLimit(account.id);
        const body = await read(req);
        const name = typeof body?.name === 'string' ? body.name.trim().toLowerCase() : '';
        if (!name) throw fail(400, 'INVALID_NAME');
        const target = db.prepare('SELECT id FROM accounts WHERE name=?').get(name);
        if (!target) throw fail(404, 'ACCOUNT_NOT_FOUND');
        if (target.id === account.id) throw fail(400, 'CANNOT_FRIEND_SELF');
        // Engelleyen taraf bilgilendirilmez: istek sessizce düşer.
        if (isBlocked(account.id, target.id)) throw fail(409, 'USER_BLOCKED');
        if (isBlocked(target.id, account.id)) return send(200, { status: 'pending' });
        const [a, b] = account.id < target.id ? [account.id, target.id] : [target.id, account.id];
        if (db.prepare('SELECT 1 FROM friendships WHERE account_a=? AND account_b=?').get(a, b)) throw fail(409, 'ALREADY_FRIENDS');
        // Kullanıcı isteği: "Maksimum 50 arkadaşımız olabilir."
        if (friendCount(account.id) >= FRIEND_MAX_COUNT) throw fail(409, 'FRIEND_LIMIT_REACHED');
        const reverse = db.prepare('SELECT id FROM friend_requests WHERE from_account=? AND to_account=?').get(target.id, account.id);
        if (reverse) {
          if (friendCount(target.id) >= FRIEND_MAX_COUNT) throw fail(409, 'TARGET_FRIEND_LIMIT_REACHED');
          db.exec('BEGIN IMMEDIATE');
          try {
            db.prepare('DELETE FROM friend_requests WHERE id=?').run(reverse.id);
            db.prepare('INSERT OR IGNORE INTO friendships(account_a,account_b,created_at) VALUES(?,?,?)').run(a, b, Date.now());
            db.exec('COMMIT');
          } catch (error) { db.exec('ROLLBACK'); throw error; }
          const accepterName = mainCharacterOf(db.prepare('SELECT data FROM backups WHERE account=?').get(account.id))?.nickname || account.name;
          sendPush(target.id, 'social', { title: 'Yeni arkadaş!', body: `${accepterName} ile artık arkadaşsınız.`, tag: 'friend', url: '/' }).catch(() => {});
          return send(200, { status: 'accepted' });
        }
        try { db.prepare('INSERT INTO friend_requests(from_account,to_account,created_at) VALUES(?,?,?)').run(account.id, target.id, Date.now()); }
        catch (error) { if (error.code?.startsWith('ERR_SQLITE')) throw fail(409, 'REQUEST_ALREADY_SENT'); throw error; }
        const requesterName = mainCharacterOf(db.prepare('SELECT data FROM backups WHERE account=?').get(account.id))?.nickname || account.name;
        sendPush(target.id, 'social', { title: 'Yeni arkadaşlık isteği', body: `${requesterName} seni arkadaş olarak eklemek istiyor.`, tag: 'friend-request', url: '/' }).catch(() => {});
        return send(200, { status: 'pending' });
      }
      const friendAcceptMatch = path.match(/^\/api\/social\/friends\/(\d+)\/accept$/);
      if (friendAcceptMatch && req.method === 'POST') {
        const id = Number(friendAcceptMatch[1]);
        db.exec('BEGIN IMMEDIATE');
        try {
          const reqRow = db.prepare('SELECT * FROM friend_requests WHERE id=? AND to_account=?').get(id, account.id);
          if (!reqRow) throw fail(404, 'REQUEST_NOT_FOUND');
          if (friendCount(account.id) >= FRIEND_MAX_COUNT) throw fail(409, 'FRIEND_LIMIT_REACHED');
          if (friendCount(reqRow.from_account) >= FRIEND_MAX_COUNT) throw fail(409, 'TARGET_FRIEND_LIMIT_REACHED');
          const [a, b] = reqRow.from_account < account.id ? [reqRow.from_account, account.id] : [account.id, reqRow.from_account];
          db.prepare('INSERT OR IGNORE INTO friendships(account_a,account_b,created_at) VALUES(?,?,?)').run(a, b, Date.now());
          db.prepare('DELETE FROM friend_requests WHERE id=?').run(id);
          db.exec('COMMIT');
        } catch (error) { db.exec('ROLLBACK'); throw error; }
        return send(200, { ok: true });
      }
      const friendDeclineMatch = path.match(/^\/api\/social\/friends\/(\d+)\/decline$/);
      if (friendDeclineMatch && req.method === 'POST') {
        const result = db.prepare('DELETE FROM friend_requests WHERE id=? AND (to_account=? OR from_account=?)').run(Number(friendDeclineMatch[1]), account.id, account.id);
        if (result.changes === 0) throw fail(404, 'REQUEST_NOT_FOUND');
        return send(200, { ok: true });
      }
      const unfriendMatch = path.match(/^\/api\/social\/friends\/(\d+)$/);
      if (unfriendMatch && req.method === 'DELETE') {
        const otherId = Number(unfriendMatch[1]);
        const [a, b] = account.id < otherId ? [account.id, otherId] : [otherId, account.id];
        db.prepare('DELETE FROM friendships WHERE account_a=? AND account_b=?').run(a, b);
        return send(200, { ok: true });
      }
      // ---- Engelleme ve şikayet ----
      // Hedef; genel sohbet mesajı (messageId), aldığım özel mesaj (dmId), klan
      // (clanId) ya da doğrudan hesap (accountId, ör. arkadaş listesi) olabilir.
      // İstemci hesap kimliğini sohbet mesajlarında hiç görmez; sunucu çözer.
      const moderationTarget = (body) => {
        if (Number.isSafeInteger(body?.messageId)) {
          const row = db.prepare('SELECT account_id,author,text FROM chat_messages WHERE id=?').get(body.messageId);
          if (!row?.account_id) throw fail(404, 'MESSAGE_NOT_FOUND');
          return { id: row.account_id, content: `${row.author}: ${row.text}`, context: 'chat' };
        }
        if (Number.isSafeInteger(body?.dmId)) {
          const row = db.prepare('SELECT from_account,text FROM direct_messages WHERE id=? AND to_account=?').get(body.dmId, account.id);
          if (!row) throw fail(404, 'MESSAGE_NOT_FOUND');
          return { id: row.from_account, content: row.text, context: 'dm' };
        }
        if (Number.isSafeInteger(body?.clanId)) {
          const row = db.prepare("SELECT clans.name AS name, clan_members.account_id AS leader FROM clans JOIN clan_members ON clan_members.clan_id=clans.id AND clan_members.role='leader' WHERE clans.id=?").get(body.clanId);
          if (!row) throw fail(404, 'CLAN_NOT_FOUND');
          return { id: row.leader, content: `Klan: ${row.name}`, context: 'clan' };
        }
        if (Number.isSafeInteger(body?.accountId)) return { id: body.accountId, content: '', context: 'profile' };
        throw fail(400, 'INVALID_TARGET');
      };
      if (path === '/api/social/blocks' && req.method === 'GET') {
        return send(200, db.prepare('SELECT accounts.id AS accountId, accounts.name AS name FROM user_blocks JOIN accounts ON accounts.id=user_blocks.blocked WHERE user_blocks.blocker=? ORDER BY user_blocks.created_at DESC').all(account.id));
      }
      if (path === '/api/social/block' && req.method === 'POST') {
        socialRateLimit(account.id);
        const target = moderationTarget(await read(req));
        if (target.id === account.id) throw fail(400, 'CANNOT_BLOCK_SELF');
        if (!db.prepare('SELECT 1 FROM accounts WHERE id=?').get(target.id)) throw fail(404, 'ACCOUNT_NOT_FOUND');
        if (db.prepare('SELECT COUNT(*) AS n FROM user_blocks WHERE blocker=?').get(account.id).n >= BLOCK_LIMIT) throw fail(409, 'BLOCK_LIMIT_REACHED');
        const [a, b] = account.id < target.id ? [account.id, target.id] : [target.id, account.id];
        db.exec('BEGIN IMMEDIATE');
        try {
          db.prepare('INSERT OR IGNORE INTO user_blocks(blocker,blocked,created_at) VALUES(?,?,?)').run(account.id, target.id, Date.now());
          db.prepare('DELETE FROM friendships WHERE account_a=? AND account_b=?').run(a, b);
          db.prepare('DELETE FROM friend_requests WHERE (from_account=? AND to_account=?) OR (from_account=? AND to_account=?)').run(account.id, target.id, target.id, account.id);
          db.exec('COMMIT');
        } catch (error) { db.exec('ROLLBACK'); throw error; }
        return send(200, { ok: true });
      }
      const unblockMatch = path.match(/^\/api\/social\/blocks\/(\d+)$/);
      if (unblockMatch && req.method === 'DELETE') {
        db.prepare('DELETE FROM user_blocks WHERE blocker=? AND blocked=?').run(account.id, Number(unblockMatch[1]));
        return send(200, { ok: true });
      }
      if (path === '/api/social/report' && req.method === 'POST') {
        socialRateLimit(account.id);
        const body = await read(req);
        if (!REPORT_REASONS.includes(body?.reason)) throw fail(400, 'INVALID_REASON');
        const details = typeof body?.details === 'string' ? body.details.trim().slice(0, 300) : '';
        const target = moderationTarget(body);
        if (target.id === account.id) throw fail(400, 'CANNOT_REPORT_SELF');
        const targetRow = db.prepare('SELECT name FROM accounts WHERE id=?').get(target.id);
        if (!targetRow) throw fail(404, 'ACCOUNT_NOT_FOUND');
        const now = Date.now();
        if (db.prepare('SELECT COUNT(*) AS n FROM user_reports WHERE reporter=? AND created_at>?').get(account.id, now - 86400000).n >= REPORT_DAILY_LIMIT) throw fail(429, 'TOO_MANY_REPORTS');
        // Aynı içerik için art arda şikayet tek kayıt sayılır.
        if (!db.prepare('SELECT 1 FROM user_reports WHERE reporter=? AND target=? AND content=? AND created_at>?').get(account.id, target.id, target.content, now - 3600000)) {
          db.prepare('INSERT INTO user_reports(reporter,target,target_name,context,content,reason,details,created_at) VALUES(?,?,?,?,?,?,?,?)').run(account.id, target.id, targetRow.name, target.context, target.content.slice(0, 600), body.reason, details, now);
        }
        return send(200, { ok: true });
      }
      // Özel mesaj — sadece gerçek arkadaşlar arasında (kullanıcı isteği:
      // "özel sohbet"). Genel sohbetin aksine (chat_messages, herkese açık)
      // burası iki hesap arasındaki tek konuşmayı filtreliyor.
      const areFriends = (x, y) => { const [a, b] = x < y ? [x, y] : [y, x]; return !!db.prepare('SELECT 1 FROM friendships WHERE account_a=? AND account_b=?').get(a, b); };
      const dmMatch = path.match(/^\/api\/social\/messages\/(\d+)$/);
      if (dmMatch && req.method === 'GET') {
        const otherId = Number(dmMatch[1]);
        if (!areFriends(account.id, otherId)) throw fail(403, 'NOT_FRIENDS');
        const rows = db.prepare('SELECT id, from_account, text, created_at, avatar_id,frame_id FROM direct_messages WHERE (from_account=? AND to_account=?) OR (from_account=? AND to_account=?) ORDER BY id DESC LIMIT 100').all(account.id, otherId, otherId, account.id).reverse();
        return send(200, rows.map(r => ({ id: r.id, mine: r.from_account === account.id, text: r.text, createdAt: r.created_at,avatarId:r.avatar_id,frameId:r.frame_id||null })));
      }
      if (dmMatch && req.method === 'POST') {
        const otherId = Number(dmMatch[1]);
        dmRateLimit(account.id);
        if (!areFriends(account.id, otherId)) throw fail(403, 'NOT_FRIENDS');
        const body = await read(req);
        const text = typeof body?.text === 'string' ? maskProfanity(body.text.trim().slice(0, 500)) : '';
        if (!text) throw fail(400, 'INVALID_MESSAGE');
        const createdAt = Date.now();
        const avatarId=body.avatarId??'human-warrior';
        if(!validPlayerAvatar(avatarId))throw fail(400,'INVALID_AVATAR');
        const frameId=body.frameId??null;
        if(!validAvatarFrame(frameId))throw fail(400,'INVALID_AVATAR');
        db.prepare('INSERT INTO direct_messages(from_account,to_account,text,created_at,avatar_id,frame_id) VALUES(?,?,?,?,?,?)').run(account.id, otherId, text, createdAt,avatarId,frameId);
        db.prepare('DELETE FROM direct_messages WHERE created_at < ?').run(Date.now() - DM_MESSAGE_TTL_MS);
        const id = db.prepare('SELECT last_insert_rowid() AS id').get().id;
        const senderName = mainCharacterOf(db.prepare('SELECT data FROM backups WHERE account=?').get(account.id))?.nickname || account.name;
        sendPush(otherId, 'social', { title: senderName, body: text.slice(0, 120), tag: `dm-${account.id}`, url: '/' }).catch(() => {});
        return send(200, { id, mine: true, text, createdAt,avatarId,frameId });
      }
      // Faz 6 — gerçek çok-oyunculu klan. Kuruluş maliyeti (elmas) oyundaki
      // HER ekonomi hareketi gibi istemcide düşülüyor (bkz. dosyanın en
      // üstündeki genel güven notu); sunucu sadece klan/üyelik KAYDININ
      // kendisini (kimin hangi klanda, hazine, davetler) otoriter tutuyor —
      // bunlar gerçek başka oyuncularla paylaşılan veri olduğu için asla
      // istemciye bırakılamaz.
      const characterHeader=req.headers['x-character-key'];
      const myCharacters=path.startsWith("/api/clan")?savedCharacters(db,account.id):[];
      const primary=primaryCharacter(db,account.id,myCharacters);
      const myCharacterKey=characterHeader||primary.key;
      const myCharacter=myCharacters.find((c,i)=>c&&characterKey(c,i)===myCharacterKey);
      if(path.startsWith('/api/clan')&&characterHeader&&!myCharacter)throw fail(409,'CHARACTER_NOT_SYNCED');
      const myMembership = () => db.prepare('SELECT * FROM clan_members WHERE account_id=? AND character_key=?').get(account.id,myCharacterKey);
      if(path==='/api/clan/avatar'&&req.method==='PATCH'){
        const member=myMembership();
        if(member?.role!=='leader')throw fail(403,'LEADER_REQUIRED');
        const body=await read(req);
        if(!validClanAvatar(body?.avatarId))throw fail(400,'INVALID_AVATAR');
        db.prepare('UPDATE clans SET avatar_id=? WHERE id=?').run(body.avatarId,member.clan_id);
        return send(200,{avatarId:body.avatarId});
      }
      if (path === '/api/clan' && req.method === 'POST') {
        const body = await read(req);
        const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 24) : '';
        const color = CLAN_COLORS.includes(body?.color) ? body.color : CLAN_COLORS[0];
        const avatarId=body?.avatarId??'wolf';
        if(!validClanAvatar(avatarId))throw fail(400,'INVALID_AVATAR');
        if (!name) throw fail(400, 'INVALID_CLAN_NAME');
        if (containsProfanityLoose(name)) throw fail(400, 'NAME_NOT_ALLOWED');
        if (myMembership()) throw fail(409, 'ALREADY_IN_CLAN');
        db.exec('BEGIN IMMEDIATE');
        try {
          const paid = wallet.spendInTransaction(account.id, 'clanFound', null, name);
          let clanId;
          try {
            db.prepare('INSERT INTO clans(name,color,founder_account,created_at,avatar_id) VALUES(?,?,?,?,?)').run(name, color, account.id, Date.now(),avatarId);
            clanId = db.prepare('SELECT last_insert_rowid() AS id').get().id;
          } catch (error) { if (error.code?.startsWith('ERR_SQLITE')) throw fail(409, 'CLAN_NAME_TAKEN'); throw error; }
          db.prepare('INSERT INTO clan_members(account_id,character_key,clan_id,role,joined_at,donated_np) VALUES(?,?,?,?,?,0)').run(account.id,myCharacterKey, clanId, 'leader', Date.now());
          db.exec('COMMIT');
          return send(200, { clanId, diamonds: paid.diamonds });
        } catch (error) { db.exec('ROLLBACK'); throw error; }
      }
      if (path === '/api/clan/mine' && req.method === 'GET') {
        const membership = myMembership();
        if (!membership) return send(200, { clan: null });
        const clan = db.prepare('SELECT * FROM clans WHERE id=?').get(membership.clan_id);
        if (!clan) { db.prepare('DELETE FROM clan_members WHERE account_id=? AND character_key=?').run(account.id,myCharacterKey); return send(200, { clan: null }); }
        // Üyenin görünen adı/sınıfı — düello rakibi seçiminde kullanılan
        // AYNI "en yüksek seviyeli karakter = ana karakter" sezgisi (bkz.
        // /api/warzone/duel/opponent), tutarlılık için tekrarlanıyor.
        const memberRows = db.prepare('SELECT clan_members.account_id AS accountId, clan_members.character_key AS characterKey, clan_members.role AS role, clan_members.joined_at AS joinedAt, clan_members.donated_np AS donatedNp, accounts.name AS accountName, backups.data AS data FROM clan_members JOIN accounts ON accounts.id=clan_members.account_id LEFT JOIN backups ON backups.account=clan_members.account_id WHERE clan_members.clan_id=?').all(clan.id);
        const members = memberRows.map(r => {
          let main = null;
          if (r.data) {
            try {
              const parsed = JSON.parse(r.data);
              const chars = Array.isArray(parsed?.characters) ? parsed.characters : [];
              main = chars.find((c,i)=>c&&characterKey(c,i)===r.characterKey);
            } catch { /* bozuk yedek — hesap adına düş */ }
          }
          return { accountId: r.accountId, characterKey:r.characterKey, name: main?.nickname || r.accountName, avatarId:playerAvatarId(main),frameId:validAvatarFrame(main?.avatarFrameId)?main?.avatarFrameId||null:null,cls: main?.class || null, level: main?.level || 0, role: r.role, joinedAt: r.joinedAt, donatedNp: r.donatedNp };
        });
        return send(200, { clan: {
          id: clan.id, name: clan.name, color: clan.color, avatarId:clan.avatar_id,createdAt: clan.created_at,
          buildingLevel: clan.building_level,
          treasury: {
            gold: clan.treasury_gold, diamonds: clan.treasury_diamonds, np: clan.treasury_np,
            wood: clan.treasury_root_fragment, silver: clan.treasury_midboss_trophy,
            iron: clan.treasury_twilight_essence, goldBar: clan.treasury_finalboss_trophy,
          },
          myRole: membership.role, myDonatedNp: membership.donated_np,
          members,
        } });
      }
      if (path === '/api/clan/invite' && req.method === 'POST') {
        socialRateLimit(account.id);
        const membership = myMembership();
        if (!membership || (membership.role !== 'leader' && membership.role !== 'officer')) throw fail(403, 'LEADER_OFFICER_ONLY');
        const body = await read(req);
        const name = typeof body?.name === 'string' ? body.name.trim() : '';
        let target=null,targetCharacter=null;
        for(const row of db.prepare('SELECT account,data FROM backups').all()){
          const chars=JSON.parse(row.data).characters||[];const i=chars.findIndex(c=>c?.nickname?.toLocaleLowerCase('tr')===name.toLocaleLowerCase('tr'));
          if(i>=0){if(target)throw fail(409,'AMBIGUOUS_CHARACTER_NAME');target={id:row.account};targetCharacter=characterKey(chars[i],i);}
        }
        if(!target){target=db.prepare('SELECT id FROM accounts WHERE name=?').get(name.toLowerCase());if(target)targetCharacter=primaryCharacter(db,target.id).key;}
        if (!target) throw fail(404, 'ACCOUNT_NOT_FOUND');
        if (target.id === account.id&&targetCharacter===myCharacterKey) throw fail(400, 'CANNOT_INVITE_SELF');
        if (isBlocked(account.id, target.id)) throw fail(409, 'USER_BLOCKED');
        if (isBlocked(target.id, account.id)) return send(200, { ok: true });
        if (db.prepare('SELECT 1 FROM clan_members WHERE account_id=? AND character_key=?').get(target.id,targetCharacter)) throw fail(409, 'TARGET_ALREADY_IN_CLAN');
        const memberCount = db.prepare('SELECT COUNT(*) AS c FROM clan_members WHERE clan_id=?').get(membership.clan_id).c;
        if (memberCount >= CLAN_MAX_MEMBERS) throw fail(409, 'CLAN_FULL');
        db.prepare('INSERT INTO clan_invites(clan_id,from_account,to_account,to_character,created_at) VALUES(?,?,?,?,?) ON CONFLICT(clan_id,to_account,to_character) DO UPDATE SET from_account=excluded.from_account, created_at=excluded.created_at').run(membership.clan_id, account.id, target.id,targetCharacter, Date.now());
        return send(200, { ok: true });
      }
      if (path === '/api/clan/invites' && req.method === 'GET') {
        const rows = db.prepare('SELECT clan_invites.id AS id, clans.id AS clanId, clans.name AS clanName, clans.color AS clanColor, clans.avatar_id AS avatarId, accounts.name AS fromName, clan_invites.created_at AS createdAt FROM clan_invites JOIN clans ON clans.id=clan_invites.clan_id JOIN accounts ON accounts.id=clan_invites.from_account WHERE clan_invites.to_account=? AND clan_invites.to_character=?').all(account.id,myCharacterKey);
        return send(200, rows.map(r => ({ id: r.id, clanId: r.clanId, clanName: r.clanName, clanColor: r.clanColor, avatarId:r.avatarId, fromName: r.fromName, createdAt: r.createdAt })));
      }
      const clanInviteAcceptMatch = path.match(/^\/api\/clan\/invites\/(\d+)\/accept$/);
      if (clanInviteAcceptMatch && req.method === 'POST') {
        if (myMembership()) throw fail(409, 'ALREADY_IN_CLAN');
        db.exec('BEGIN IMMEDIATE');
        try {
          const invite = db.prepare('SELECT * FROM clan_invites WHERE id=? AND to_account=? AND to_character=?').get(Number(clanInviteAcceptMatch[1]), account.id,myCharacterKey);
          if (!invite) throw fail(404, 'INVITE_NOT_FOUND');
          const memberCount = db.prepare('SELECT COUNT(*) AS c FROM clan_members WHERE clan_id=?').get(invite.clan_id).c;
          if (memberCount >= CLAN_MAX_MEMBERS) throw fail(409, 'CLAN_FULL');
          db.prepare('INSERT INTO clan_members(account_id,character_key,clan_id,role,joined_at,donated_np) VALUES(?,?,?,?,?,0)').run(account.id,myCharacterKey, invite.clan_id, 'member', Date.now());
          // Bir klana katılınca diğer tüm bekleyen davetler anlamsızlaşıyor
          // (aynı anda tek klanda olunabilir).
          db.prepare('DELETE FROM clan_invites WHERE to_account=? AND to_character=?').run(account.id,myCharacterKey);
          db.exec('COMMIT');
        } catch (error) { db.exec('ROLLBACK'); throw error; }
        return send(200, { ok: true });
      }
      const clanInviteDeclineMatch = path.match(/^\/api\/clan\/invites\/(\d+)\/decline$/);
      if (clanInviteDeclineMatch && req.method === 'POST') {
        const result = db.prepare('DELETE FROM clan_invites WHERE id=? AND to_account=? AND to_character=?').run(Number(clanInviteDeclineMatch[1]), account.id,myCharacterKey);
        if (result.changes === 0) throw fail(404, 'INVITE_NOT_FOUND');
        return send(200, { ok: true });
      }
      // Ayrılınca kendi bağışladığı NP'nin iadesi (%35) İSTEMCİDE hesaplanıyor
      // (bkz. utils/clan.js#leaveClan, kullanıcı isteği) — sunucu sadece o
      // hesaplamayı yapabilmesi için ayrılan üyenin gerçek donated_np'sini
      // döndürüyor. Lider ayrılırsa: kalan üyelerden biri (önce subay, sonra
      // en kıdemli) otomatik lider olur; kimse kalmadıysa klan tamamen silinir.
      if (path === '/api/clan/leave' && req.method === 'POST') {
        if (game.enabled(account.id)) throw fail(409, 'USE_GAME_ACT');
        db.exec('BEGIN IMMEDIATE');
        try {
          const membership = myMembership();
          if (!membership) throw fail(409, 'NOT_IN_CLAN');
          const donatedNp = membership.donated_np;
          removeFromClan(membership, account.id, myCharacterKey);
          db.exec('COMMIT');
          return send(200, { donatedNp });
        } catch (error) { db.exec('ROLLBACK'); throw error; }
      }
      if (path === '/api/clan/kick' && req.method === 'POST') {
        const membership = myMembership();
        if (!membership || (membership.role !== 'leader' && membership.role !== 'officer')) throw fail(403, 'LEADER_OFFICER_ONLY');
        const body = await read(req);
        const targetId = Number(body?.accountId);
        if(!Number.isSafeInteger(targetId)||targetId<1)throw fail(400,'INVALID_TARGET');
        const targetKey=body?.characterKey||primaryCharacter(db,targetId).key;
        if (!Number.isSafeInteger(targetId) || (targetId === account.id&&targetKey===myCharacterKey)) throw fail(400, 'INVALID_TARGET');
        const target = db.prepare('SELECT * FROM clan_members WHERE account_id=? AND character_key=? AND clan_id=?').get(targetId,targetKey, membership.clan_id);
        if (!target) throw fail(404, 'MEMBER_NOT_FOUND');
        if (target.role === 'leader') throw fail(400, 'CANNOT_KICK_LEADER');
        db.prepare('UPDATE clan_dungeon_state SET locked_by=NULL,locked_character=NULL,locked_by_name=NULL,locked_until=NULL WHERE clan_id=? AND locked_by=? AND locked_character=?').run(membership.clan_id,targetId,targetKey);
        db.prepare('DELETE FROM clan_members WHERE account_id=? AND character_key=?').run(targetId,targetKey);
        return send(200, { ok: true });
      }
      if ((path === '/api/clan/promote' || path === '/api/clan/demote') && req.method === 'POST') {
        const membership = myMembership();
        if (!membership || membership.role !== 'leader') throw fail(403, 'LEADER_ONLY');
        const body = await read(req);
        const targetId = Number(body?.accountId);
        if(!Number.isSafeInteger(targetId)||targetId<1)throw fail(400,'INVALID_TARGET');
        const targetKey=body?.characterKey||primaryCharacter(db,targetId).key;
        const target = db.prepare('SELECT * FROM clan_members WHERE account_id=? AND character_key=? AND clan_id=?').get(targetId,targetKey, membership.clan_id);
        if (!target || target.role === 'leader') throw fail(404, 'MEMBER_NOT_FOUND');
        if (path === '/api/clan/promote') {
          if (target.role !== 'officer') {
            const officerCount = db.prepare("SELECT COUNT(*) AS c FROM clan_members WHERE clan_id=? AND role='officer'").get(membership.clan_id).c;
            if (officerCount >= CLAN_MAX_OFFICERS) throw fail(409, 'TOO_MANY_OFFICERS');
            db.prepare("UPDATE clan_members SET role='officer' WHERE account_id=? AND character_key=?").run(targetId,targetKey);
          }
        } else {
          db.prepare("UPDATE clan_members SET role='member' WHERE account_id=? AND character_key=? AND role='officer'").run(targetId,targetKey);
        }
        return send(200, { ok: true });
      }
      // Bağış: oyuncunun kendi altın/elmas/NP düşüşü istemcide (dosyanın
      // üstündeki genel güven notuyla aynı seviye) — sunucu sadece PAYLAŞILAN
      // hazineyi (gerçek diğer üyelerin de gördüğü) atomik olarak artırıyor.
      if (path === '/api/clan/donate' && req.method === 'POST') {
        const membership = myMembership();
        if (!membership) throw fail(409, 'NOT_IN_CLAN');
        const body = await read(req);
        const amount = Number(body?.amount);
        const currency = ['gold', 'diamonds', 'np', ...Object.keys(CLAN_MATERIAL_COLUMN)].includes(body?.currency) ? body.currency : null;
        if (!currency || !Number.isSafeInteger(amount) || amount <= 0) throw fail(400, 'INVALID_DONATION');
        if (currency !== 'diamonds' && game.enabled(account.id)) throw fail(409, 'USE_GAME_ACT');
        const column = CLAN_MATERIAL_COLUMN[currency] || (currency === 'gold' ? 'treasury_gold' : currency === 'diamonds' ? 'treasury_diamonds' : 'treasury_np');
        db.exec('BEGIN IMMEDIATE');
        try {
          const diamonds = currency === 'diamonds' ? wallet.debitInTransaction(account.id, amount, 'clan-donate', String(membership.clan_id)) : null;
          db.prepare(`UPDATE clans SET ${column} = ${column} + ? WHERE id=?`).run(amount, membership.clan_id);
          if (currency === 'np') db.prepare('UPDATE clan_members SET donated_np = donated_np + ? WHERE account_id=? AND character_key=?').run(amount, account.id,myCharacterKey);
          db.exec('COMMIT');
        } catch (error) { db.exec('ROLLBACK'); throw error; }
        return send(200, { ok: true, ...(currency === 'diamonds' ? { diamonds: wallet.balance(account.id) } : {}) });
      }
      // Bina yükseltmesi PAYLAŞILAN hazineden düştüğü için (kendi cebinden
      // değil) burası sunucu-otoriter — maliyet/tavan istemciyle aynı sabit
      // dosyadan (bkz. yukarıdaki import), iki taraf asla sapamaz.
      if (path === '/api/clan/building/upgrade' && req.method === 'POST') {
        const membership = myMembership();
        if (!membership || (membership.role !== 'leader' && membership.role !== 'officer')) throw fail(403, 'LEADER_OFFICER_ONLY');
        db.exec('BEGIN IMMEDIATE');
        try {
          const clan = db.prepare('SELECT * FROM clans WHERE id=?').get(membership.clan_id);
          if (clan.building_level >= CLAN_BUILDING_MAX_LEVEL) throw fail(409, 'CLAN_BUILDING_MAX_LEVEL');
          const cost = CLAN_BUILDING_UPGRADE_COST[clan.building_level + 1];
          const materialCost = CLAN_BUILDING_MATERIAL_COST[clan.building_level + 1];
          if (clan.treasury_gold < cost.gold || clan.treasury_diamonds < cost.diamonds) throw fail(409, 'TREASURY_NEEDS_COST');
          for (const [key, column] of Object.entries(CLAN_MATERIAL_COLUMN)) {
            if (clan[column] < materialCost[key]) throw fail(409, 'TREASURY_NEEDS_MATERIALS');
          }
          const materialSets = Object.entries(CLAN_MATERIAL_COLUMN).map(([key, column]) => `${column}=${column}-${materialCost[key]}`).join(',');
          db.prepare(`UPDATE clans SET building_level=building_level+1, treasury_gold=treasury_gold-?, treasury_diamonds=treasury_diamonds-?, ${materialSets} WHERE id=?`).run(cost.gold, cost.diamonds, clan.id);
          db.exec('COMMIT');
          return send(200, { buildingLevel: clan.building_level + 1 });
        } catch (error) { db.exec('ROLLBACK'); throw error; }
      }
      // Klan Dungeon — kullanıcının pasted spec'i. Aşama/HP klan başına TEK
      // satır (paylaşılan can havuzu); satır her okunduğunda gün değiştiyse
      // (todayKey()) lazy olarak sıfırlanıyor (cron gerekmiyor, boss_fights'ın
      // spawn_at anahtarına dayanmasıyla aynı ilke). Kilit zaman aşımı,
      // websocket'siz mimaride gerçek "bağlantı koptu" tespitinin yerini tutuyor.
      const clanDungeonRow = (clanId) => {
        const today = todayKey();
        let row = db.prepare('SELECT * FROM clan_dungeon_state WHERE clan_id=?').get(clanId);
        if (!row || row.day_key !== today) {
          const stage1 = clanDungeonStage(1);
          db.prepare(`INSERT INTO clan_dungeon_state(clan_id,day_key,stage_index,monster_hp,completed,locked_by,locked_by_name,locked_until) VALUES(?,?,1,?,0,NULL,NULL,NULL)
            ON CONFLICT(clan_id) DO UPDATE SET day_key=excluded.day_key, stage_index=1, monster_hp=excluded.monster_hp, completed=0, locked_by=NULL, locked_by_name=NULL, locked_until=NULL`)
            .run(clanId, today, stage1.hp);
          row = db.prepare('SELECT * FROM clan_dungeon_state WHERE clan_id=?').get(clanId);
        }
        if (row.locked_by && row.locked_until && Date.now() > row.locked_until) {
          db.prepare('UPDATE clan_dungeon_state SET locked_by=NULL, locked_by_name=NULL, locked_until=NULL WHERE clan_id=?').run(clanId);
          row = { ...row, locked_by: null, locked_by_name: null, locked_until: null };
        }
        return row;
      };
      const clanDungeonAttempts = (accountId) => {
        const today = todayKey();
        return db.prepare('SELECT * FROM clan_dungeon_attempts WHERE account_id=? AND character_key=? AND day_key=?').get(accountId,myCharacterKey, today)
          || { account_id: accountId, day_key: today, entries_used: 0, first_entry_at: null };
      };
      const dungeonAttemptsInfo = (accountId) => {
        const row = clanDungeonAttempts(accountId);
        const entriesLeft = Math.max(0, CLAN_DUNGEON_DAILY_ENTRIES - row.entries_used);
        let cooldownRemainingMs = 0;
        if (row.entries_used === 1 && row.first_entry_at) cooldownRemainingMs = Math.max(0, (row.first_entry_at + CLAN_DUNGEON_COOLDOWN_MS) - Date.now());
        return { entriesUsed: row.entries_used, entriesLeft, cooldownRemainingMs };
      };
      if (path === '/api/clan/dungeon' && req.method === 'GET') {
        const membership = myMembership();
        if (!membership) throw fail(409, 'NOT_IN_CLAN');
        const row = clanDungeonRow(membership.clan_id);
        return send(200, {
          dayKey: row.day_key, stageIndex: row.stage_index, totalStages: TOTAL_STAGES,
          stage: clanDungeonStage(row.stage_index), monsterHp: row.monster_hp, completed: !!row.completed,
          locked: !!row.locked_by, lockedByMe: row.locked_by === account.id&&row.locked_character===myCharacterKey, lockedByName: row.locked_by_name || null,
          lockedUntil: row.locked_until || null,
          attempts: dungeonAttemptsInfo(account.id),
        });
      }
      if (path === '/api/clan/dungeon/log' && req.method === 'GET') {
        const membership = myMembership();
        if (!membership) throw fail(409, 'NOT_IN_CLAN');
        const rows = db.prepare('SELECT id,account_name,stage_index,damage,killed,created_at FROM clan_dungeon_log WHERE clan_id=? AND day_key=? ORDER BY id DESC LIMIT 30')
          .all(membership.clan_id, todayKey());
        return send(200, rows.map(r => ({ id: r.id, name: r.account_name, stageIndex: r.stage_index, damage: r.damage, killed: !!r.killed, createdAt: r.created_at })));
      }
      if (path === '/api/clan/dungeon/enter' && req.method === 'POST') {
        const membership = myMembership();
        if (!membership) throw fail(409, 'NOT_IN_CLAN');
        db.exec('BEGIN IMMEDIATE');
        try {
          const row = clanDungeonRow(membership.clan_id);
          if (row.completed) throw fail(409, 'DUNGEON_COMPLETE');
          if (row.locked_by && (row.locked_by !== account.id||row.locked_character!==myCharacterKey)) throw fail(409, 'LOCKED_BY_OTHER');
          if (!row.locked_by) {
            const attempts = clanDungeonAttempts(account.id);
            if (attempts.entries_used >= CLAN_DUNGEON_DAILY_ENTRIES) throw fail(409, 'ENTRIES_EXHAUSTED');
            if (attempts.entries_used === 1 && attempts.first_entry_at && Date.now() < attempts.first_entry_at + CLAN_DUNGEON_COOLDOWN_MS) throw fail(409, 'COOLDOWN_ACTIVE');
            const nextUsed = attempts.entries_used + 1;
            const nextFirstAt = attempts.entries_used === 0 ? Date.now() : attempts.first_entry_at;
            db.prepare(`INSERT INTO clan_dungeon_attempts(account_id,character_key,day_key,entries_used,first_entry_at) VALUES(?,?,?,?,?)
              ON CONFLICT(account_id,character_key,day_key) DO UPDATE SET entries_used=excluded.entries_used, first_entry_at=excluded.first_entry_at`)
              .run(account.id,myCharacterKey, attempts.day_key, nextUsed, nextFirstAt);
            const displayName = myCharacter?.nickname || account.name;
            db.prepare('UPDATE clan_dungeon_state SET locked_by=?, locked_character=?, locked_by_name=?, locked_until=? WHERE clan_id=?')
              .run(account.id,myCharacterKey, displayName, Date.now() + CLAN_DUNGEON_LOCK_TIMEOUT_MS, membership.clan_id);
          }
          db.exec('COMMIT');
        } catch (error) { db.exec('ROLLBACK'); throw error; }
        const fresh = clanDungeonRow(membership.clan_id);
        return send(200, {
          stageIndex: fresh.stage_index, stage: clanDungeonStage(fresh.stage_index), monsterHp: fresh.monster_hp,
          lockedUntil: fresh.locked_until || null,
          attempts: dungeonAttemptsInfo(account.id),
        });
      }
      if (path === '/api/clan/dungeon/attack' && req.method === 'POST') {
        const membership = myMembership();
        if (!membership) throw fail(409, 'NOT_IN_CLAN');
        const body = await read(req);
        const engine = game.enabled(account.id);
        let damage = Number(body?.damage);
        db.exec('BEGIN IMMEDIATE');
        try {
          const row = clanDungeonRow(membership.clan_id);
          if (row.completed) throw fail(409, 'DUNGEON_COMPLETE');
          if (row.locked_by !== account.id||row.locked_character!==myCharacterKey) throw fail(403, 'NOT_YOUR_TURN');
          const stage = clanDungeonStage(row.stage_index);
          let shared = null;
          if (engine) {
            // Sunucu ekonomisinde hasarı istemci söylemez: eylemi bildirir, vuruşu sunucu motoru hesaplar.
            const last = lastSharedHit.get(account.id) || 0;
            if (Date.now() - last < 300) throw fail(429, 'TOO_FAST');
            lastSharedHit.set(account.id, Date.now());
            shared = game.sharedAttack(account.id, myCharacterKey, 'clan', `${row.day_key}:${row.stage_index}`, { hp: stage.hp, atk: stage.atk, def: stage.def }, row.monster_hp, body?.action);
            if (!shared.result.ok) { db.exec('ROLLBACK'); return send(200, { ok: false, reason: shared.result.reason }); }
            damage = shared.damage;
          } else {
            const DUNGEON_HIT_CAP_RATIO = 0.5; // bkz. World Boss'taki aynı ilke — tek vuruş canavar canının yarısını aşamaz
            if (!Number.isSafeInteger(damage) || damage < 0 || damage > stage.hp * DUNGEON_HIT_CAP_RATIO) throw fail(400, 'INVALID_DAMAGE');
            checkSharedHit(account.id, stage.def, damage);
          }
          const hp = Math.max(0, row.monster_hp - damage);
          let droppedMaterial = null;
          const killed = hp <= 0;
          if (killed) {
            const roll = rollClanDungeonMaterial(row.stage_index);
            if (roll.dropped) droppedMaterial = roll.key;
            if (row.stage_index >= TOTAL_STAGES) {
              // Zindan bugünlük bitti — herkese açılsın diye kilit tamamen kalkıyor.
              db.prepare('UPDATE clan_dungeon_state SET monster_hp=0, completed=1, locked_by=NULL, locked_by_name=NULL, locked_until=NULL WHERE clan_id=?').run(membership.clan_id);
            } else {
              // Bir "giriş" tek bir canavarla sınırlı değil — oyuncu ayrılana/
              // zaman aşımına uğrayana/zindanı bitirene kadar aynı girişle
              // sıradaki canavara devam eder (kilidi elinde tutar), yoksa her
              // aşama geçişinde günlük 2 giriş hakkından biri boşa harcanırdı.
              const nextStage = clanDungeonStage(row.stage_index + 1);
              db.prepare('UPDATE clan_dungeon_state SET stage_index=stage_index+1, monster_hp=?, locked_until=? WHERE clan_id=?').run(nextStage.hp, Date.now() + CLAN_DUNGEON_LOCK_TIMEOUT_MS, membership.clan_id);
            }
          } else {
            db.prepare('UPDATE clan_dungeon_state SET monster_hp=?, locked_until=? WHERE clan_id=?').run(hp, Date.now() + CLAN_DUNGEON_LOCK_TIMEOUT_MS, membership.clan_id);
          }
          // Kullanıcı isteği: "Klan paneline basit bir log ekranı koy: 'Ahmet,
          // 3. Canavara 45.000 hasar vurdu.'" — klan içi rekabet/heyecan için.
          const logName = myCharacter?.nickname || account.name;
          if (droppedMaterial && game.enabled(account.id)) db.prepare("INSERT INTO pending_grants(account,character_key,kind,grant_key,created_at) VALUES(?,?,'clanMaterial',?,?)").run(account.id, myCharacterKey, droppedMaterial, Date.now());
          db.prepare('INSERT INTO clan_dungeon_log(clan_id,day_key,account_name,stage_index,damage,killed,created_at) VALUES(?,?,?,?,?,?,?)')
            .run(membership.clan_id, row.day_key, logName, row.stage_index, damage, killed ? 1 : 0, Date.now());
          db.exec('COMMIT');
          const fresh = clanDungeonRow(membership.clan_id);
          return send(200, {
            stageIndex: fresh.stage_index, stage: clanDungeonStage(fresh.stage_index), monsterHp: fresh.monster_hp,
            lockedUntil: fresh.locked_until || null,
            completed: !!fresh.completed, stageCleared: killed, droppedMaterial,
            ...(shared ? { ok: true, shared: { result: shared.result, patch: shared.patch, revision: shared.revision } } : {}),
          });
        } catch (error) { db.exec('ROLLBACK'); throw error; }
      }
      if (path === '/api/clan/dungeon/leave' && req.method === 'POST') {
        const membership = myMembership();
        if (!membership) throw fail(409, 'NOT_IN_CLAN');
        db.prepare('UPDATE clan_dungeon_state SET locked_by=NULL, locked_by_name=NULL, locked_until=NULL WHERE clan_id=? AND locked_by=? AND locked_character=?').run(membership.clan_id, account.id,myCharacterKey);
        return send(200, { ok: true });
      }
      // Push bildirimleri — kullanıcı isteği: "Ayarlar kısmında bu
      // bildirimleri istediği gibi açıp kapatabilir." vapid-key public,
      // istemcinin abone olurken PushManager.subscribe'a vermesi gerekiyor
      // (kendisi bir sır değil — tersi, özel anahtar, hiçbir zaman dışarı
      // verilmiyor).
      if (path === '/api/push/vapid-key' && req.method === 'GET') {
        return send(200, { publicKey: VAPID_PUBLIC_KEY, enabled: PUSH_ENABLED });
      }
      if (path === '/api/push/subscribe' && req.method === 'POST') {
        const body = await read(req);
        const endpoint = typeof body?.endpoint === 'string' ? body.endpoint.slice(0, 2000) : '';
        const p256dh = typeof body?.keys?.p256dh === 'string' ? body.keys.p256dh : '';
        const auth = typeof body?.keys?.auth === 'string' ? body.keys.auth : '';
        if (!endpoint || !p256dh || !auth) throw fail(400, 'INVALID_SUBSCRIPTION');
        db.prepare(`INSERT INTO push_subscriptions(account_id,endpoint,p256dh,auth,created_at) VALUES(?,?,?,?,?)
          ON CONFLICT(account_id,endpoint) DO UPDATE SET p256dh=excluded.p256dh, auth=excluded.auth`)
          .run(account.id, endpoint, p256dh, auth, Date.now());
        return send(200, { ok: true });
      }
      if (path === '/api/push/unsubscribe' && req.method === 'POST') {
        const body = await read(req);
        const endpoint = typeof body?.endpoint === 'string' ? body.endpoint : '';
        db.prepare('DELETE FROM push_subscriptions WHERE account_id=? AND endpoint=?').run(account.id, endpoint);
        return send(200, { ok: true });
      }
      if (path === '/api/push/prefs' && req.method === 'GET') {
        const row = db.prepare('SELECT * FROM push_prefs WHERE account_id=?').get(account.id);
        return send(200, { inactivity: row ? !!row.inactivity : true, events: row ? !!row.events : true, social: row ? !!row.social : true });
      }
      if (path === '/api/push/prefs' && req.method === 'PUT') {
        const body = await read(req);
        const inactivity = body?.inactivity ? 1 : 0;
        const events = body?.events ? 1 : 0;
        const social = body?.social ? 1 : 0;
        db.prepare(`INSERT INTO push_prefs(account_id,inactivity,events,social) VALUES(?,?,?,?)
          ON CONFLICT(account_id) DO UPDATE SET inactivity=excluded.inactivity, events=excluded.events, social=excluded.social`)
          .run(account.id, inactivity, events, social);
        return send(200, { ok: true });
      }
      throw fail(404, 'NOT_FOUND');
    } catch (error) { send(error.status || 500, { error: error.status ? error.message : 'SERVER_ERROR' }); }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  return { server, close: () => new Promise(resolve => { if (pushInterval) clearInterval(pushInterval); server.close(() => { db.close(); resolve(); }); }) };
}
