// Oyun içi onay penceresi (tarayıcının window.confirm'i yerine). `askConfirm` bir söz döner: onaylanırsa true.
// Pencereyi App.jsx içindeki <ConfirmHost /> çizer.
export function askConfirm({ title, text, confirmLabel, cancelLabel, tone = "default" }) {
  return new Promise((resolve) => {
    if (typeof window === "undefined") { resolve(false); return; }
    window.dispatchEvent(new CustomEvent("nyxia:confirm", { detail: { title, text, confirmLabel, cancelLabel, tone, resolve } }));
  });
}
