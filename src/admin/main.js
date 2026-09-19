import { MAPS } from "../data/maps.js";
import { WARZONE_BOSSES } from "../data/warzone.js";
import { getDropConfig, setDropConfig, resetDropConfig } from "../utils/dropConfig.js";

// Kullanıcı isteği: "Tüm dropları düzenleyebileceğim bir sistem" + "ayrı bir
// yerden yönetmem mümkün mü" — bu, oyun ekranlarından tamamen ayrı, sadece
// `npm run dev` çalışırken erişilebilen bir sayfa (bkz. vite.config.js'in
// rollupOptions.input'u — sadece index.html derleniyor, bu sayfa production
// build'e hiç girmiyor). Oyunla AYNI localStorage'ı (bkz. utils/dropConfig.js)
// okuyup yazıyor, React'siz düz DOM ile — ayrı kalması gerektiği için oyunun
// component ağacına hiç bağımlı değil.

// getDropConfig() döndürdüğü nesnenin override'sız kısımları DEFAULT_DROP_CONFIG
// ile PAYLAŞILAN referanslar taşıyabilir (deepMerge sadece override'da olan
// anahtarları klonluyor) — bu yüzden admin sayfasının üzerinde doğrudan
// mutasyon yapacağı çalışma kopyasını burada BAĞIMSIZ bir klonla alıyoruz,
// yoksa bir alanı düzenlemek "varsayılan"ın kendisini kirletebilirdi.
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

let config = clone(getDropConfig());

function get(path) {
  return path.split(".").reduce((o, k) => (o == null ? o : o[k]), config);
}
function set(path, value) {
  const keys = path.split(".");
  let node = config;
  for (let i = 0; i < keys.length - 1; i++) node = node[keys[i]];
  node[keys[keys.length - 1]] = value;
}

function numInput(path, { pct = false, step = 1 } = {}) {
  const raw = get(path);
  const display = pct ? Math.round(raw * 1000) / 10 : raw;
  return `<input type="number" step="${pct ? 0.1 : step}" min="0" value="${display}" data-path="${path}" data-pct="${pct ? 1 : 0}" />`;
}

function renderMapSection(map) {
  const rows = map.monsters.map((m) => `
    <tr>
      <td class="name">${m.name}</td>
      <td>${numInput(`maps.${map.id}.monsters.${m.id}.goldMin`)}</td>
      <td>${numInput(`maps.${map.id}.monsters.${m.id}.goldMax`)}</td>
      <td>${numInput(`maps.${map.id}.monsters.${m.id}.xp`)}</td>
      <td class="pct-cell">${numInput(`maps.${map.id}.monsters.${m.id}.dropChance`, { pct: true })}</td>
      <td class="pct-cell">${numInput(`maps.${map.id}.monsters.${m.id}.chestChance`, { pct: true })}</td>
    </tr>`).join("");
  return `
    <details>
      <summary><span>${map.name} <span class="meta">Lv.${map.levelMin}-${map.levelMax}</span></span><span class="chev">▶</span></summary>
      <div class="section-body">
        <table>
          <thead><tr><th>Canavar</th><th>Altın Min</th><th>Altın Maks</th><th>XP</th><th>Eşya Şansı</th><th>Sandık Şansı</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </details>`;
}

function renderBossSection() {
  const rows = WARZONE_BOSSES.map((b) => `
    <tr>
      <td class="name" style="color:${b.color}">${b.name}</td>
      <td>${numInput(`warzoneBosses.${b.id}.bonusGoldMin`)}</td>
      <td>${numInput(`warzoneBosses.${b.id}.bonusGoldMax`)}</td>
      <td class="pct-cell">${numInput(`warzoneBosses.${b.id}.equipDropChance`, { pct: true })}</td>
      <td class="pct-cell">${numInput(`warzoneBosses.${b.id}.chestDropChance`, { pct: true })}</td>
      <td class="pct-cell">${numInput(`warzoneBosses.${b.id}.scrollDropChance`, { pct: true })}</td>
    </tr>`).join("");
  return `
    <details>
      <summary><span>Savaş Alanı Bossları <span class="meta">6 boss</span></span><span class="chev">▶</span></summary>
      <div class="section-body">
        <p class="hint">Her boss öldürüldüğünde bu altın aralığından rastgele bir miktar + her satırdaki yüzdeye göre bir eşya/sandık/parşömen düşer (üçü birbirinden bağımsız ayrı ayrı denenir).</p>
        <table>
          <thead><tr><th>Boss</th><th>Bonus Altın Min</th><th>Bonus Altın Maks</th><th>Eşya Şansı</th><th>Sandık Şansı</th><th>Parşömen Şansı</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </details>`;
}

function renderHuntSection() {
  return `
    <details open>
      <summary><span>Canavar Ara (Savaş Alanı)</span><span class="chev">▶</span></summary>
      <div class="section-body">
        <p class="hint">Crimson Battlefront'un canavarlarını kullanır — bu üç çarpan onların GÜCÜNÜ ve ÖDÜLÜNÜ birbirinden bağımsız ölçekler (1 = değişiklik yok, 1.5 = %50 daha fazla, 0.5 = yarı yarıya).</p>
        <div class="grid-fields">
          <div class="field"><label>Güç Çarpanı (hp/atk/def)</label>${numInput("warzoneHunt.powerMult", { step: 0.05 })}</div>
          <div class="field"><label>Altın Çarpanı</label>${numInput("warzoneHunt.goldMult", { step: 0.05 })}</div>
          <div class="field"><label>Eşya/Sandık Çarpanı</label>${numInput("warzoneHunt.dropMult", { step: 0.05 })}</div>
        </div>
      </div>
    </details>`;
}

function renderChestSection() {
  const weaponPct = get("chests.weaponPct");
  const armorPct = get("chests.armorPct");
  const accessoryPct = Math.max(0, 1 - weaponPct - armorPct);
  return `
    <details open>
      <summary><span>Sandıklar</span><span class="chev">▶</span></summary>
      <div class="section-body">
        <p class="hint">Bir sandık (veya canavar/boss'un eşya düşürmesi) açıldığında ne çıkacağının dağılımı. Silah % + Zırh % toplamı ne kadar düşükse Aksesuar (kalan, <span id="accessoryPct" class="diff">${Math.round(accessoryPct * 1000) / 10}%</span>) o kadar yüksek olur — toplamları 100'ü geçmemeli.</p>
        <div class="grid-fields">
          <div class="field pct-cell"><label>Silah Şansı</label>${numInput("chests.weaponPct", { pct: true })}</div>
          <div class="field pct-cell"><label>Zırh Şansı</label>${numInput("chests.armorPct", { pct: true })}</div>
          <div class="field pct-cell"><label>Özel Sandık — Eşsiz Eşya Şansı</label>${numInput("chests.specialUniqueChance", { pct: true })}</div>
        </div>
      </div>
    </details>`;
}

function updateAccessoryDisplay() {
  const el = document.getElementById("accessoryPct");
  if (!el) return;
  const accessoryPct = Math.max(0, 1 - get("chests.weaponPct") - get("chests.armorPct"));
  el.textContent = `${Math.round(accessoryPct * 1000) / 10}%`;
}

function render() {
  const root = document.getElementById("root");
  root.innerHTML = [
    ...MAPS.map(renderMapSection),
    renderBossSection(),
    renderHuntSection(),
    renderChestSection(),
  ].join("");
  root.addEventListener("input", onInput);
}

function onInput(e) {
  const input = e.target.closest("input[data-path]");
  if (!input) return;
  const num = parseFloat(input.value);
  if (Number.isNaN(num)) return;
  set(input.dataset.path, input.dataset.pct === "1" ? num / 100 : num);
  updateAccessoryDisplay();
  setStatus("Kaydedilmedi — değişiklik var", true);
}

function setStatus(msg, dirty) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.style.color = dirty ? "#D4AF6A" : "#5FA8A0";
}

document.getElementById("saveBtn").addEventListener("click", () => {
  setDropConfig(config);
  setStatus("Kaydedildi ✓ — oyun sekmesini yenile", false);
});

document.getElementById("resetBtn").addEventListener("click", () => {
  if (!confirm("Tüm drop ayarlarını varsayılana sıfırlamak istediğine emin misin?")) return;
  resetDropConfig();
  config = clone(getDropConfig());
  render();
  setStatus("Varsayılana sıfırlandı", false);
});

render();
