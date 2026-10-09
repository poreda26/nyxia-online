// Pencere kapanış animasyonu: React bir pencereyi DOM'dan kaldırınca, kaldırılan düğümün kopyası kısa süre ekranda kalıp solar.
// Pencereler styles.modalOverlay / styles.itemSheetOverlay ile çizildiği için satır içi `animation` adından tanınır.
// Hareket azaltma açıkken (ayar ya da sistem tercihi) hiçbir şey yapılmaz.
const OVERLAY = /nyxia(Sheet)?OverlayIn/;

export function installMotionLayer() {
  if (typeof window === "undefined" || window.__nyxiaMotionLayer) return;
  window.__nyxiaMotionLayer = true;
  const reduced = () => document.documentElement.dataset.motion === "reduced" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.removedNodes) {
        if (node.nodeType !== 1 || node.isConnected || node.classList.contains("nyxia-exit") || !OVERLAY.test(node.style?.animationName || "")) continue;
        if (reduced()) return;
        const ghost = node.cloneNode(true);
        ghost.classList.add("nyxia-exit");
        if (/Sheet/.test(node.style.animationName)) ghost.classList.add("nyxia-exit-sheet");
        ghost.setAttribute("aria-hidden", "true");
        ghost.removeAttribute("id");
        ghost.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
        ghost.querySelectorAll("button,input,select,textarea,a").forEach((el) => { el.tabIndex = -1; el.disabled = true; });
        document.body.appendChild(ghost);
        setTimeout(() => ghost.remove(), 260);
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
