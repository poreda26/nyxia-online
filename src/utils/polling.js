// Sunucuyu yormayan periyodik yoklama. setInterval'in yerine kullanılır:
//  - Uygulama arka plandayken / sekme gizliyken HİÇ istek atmaz, öne gelince
//    hemen bir kez yoklar.
//  - Her tur süreye ±%15 rastgelelik katar; binlerce istemci aynı saniyede
//    istek atmaz (dalga yapmaz).
//  - fn hata fırlatırsa ya da `false` dönerse (sunucu/ağ sorunu) aralık
//    ikiye katlanır (en fazla 16x), başarıyla toparlanınca normale döner.
// Dönen fonksiyon yoklamayı durdurur (useEffect cleanup'ı olarak kullan).
const MAX_BACKOFF_STEPS = 4;

export function startPolling(fn, intervalMs, { runNow = true, jitter = 0.15 } = {}) {
  let timer = null;
  let stopped = false;
  let failures = 0;

  const delay = () => intervalMs * 2 ** failures * (1 + (Math.random() * 2 - 1) * jitter);
  const schedule = () => {
    clearTimeout(timer);
    if (stopped || (typeof document !== "undefined" && document.hidden)) return;
    timer = setTimeout(run, delay());
  };
  async function run() {
    if (stopped || (typeof document !== "undefined" && document.hidden)) return;
    try {
      const result = await fn();
      failures = result === false ? Math.min(failures + 1, MAX_BACKOFF_STEPS) : 0;
    } catch {
      failures = Math.min(failures + 1, MAX_BACKOFF_STEPS);
    }
    schedule();
  }
  const onVisibility = () => {
    if (document.hidden) clearTimeout(timer);
    else run();
  };
  if (typeof document !== "undefined") document.addEventListener("visibilitychange", onVisibility);
  if (runNow) run(); else schedule();

  return () => {
    stopped = true;
    clearTimeout(timer);
    if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVisibility);
  };
}
