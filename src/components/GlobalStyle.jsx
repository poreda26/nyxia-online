export default function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

      /* Locks the app to exactly one screen's worth of height (the real
         viewport, not "however tall the current tab's content happens to
         be") — without this, html/body/#root have no defined height, so
         appRoot's height:100% resolves to nothing and it silently falls
         back to growing with content instead, which is why the frame used
         to visibly resize switching between tabs. */
      html, body, #root { height: 100%; }
      body { margin: 0; overscroll-behavior: none; }

      :root {
        --bg-void: #0B0C10;
        --bg-panel: #15171E;
        --bg-panel-alt: #1B1E27;
        --border: #262A35;
        --text-primary: #EDE8DC;
        --text-muted: #9CA1B0;
        --text-faint: #5C6072;
        --font-display: 'Cinzel', serif;
        --font-body: 'Manrope', sans-serif;
        --font-mono: 'JetBrains Mono', monospace;
      }

      .shake { animation: shakeAnim 0.26s ease; }
      @keyframes shakeAnim {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
      }

      .chest-shake { animation: chestShake 0.5s ease-in-out infinite; display: inline-block; }
      @keyframes chestShake {
        0%, 100% { transform: rotate(0deg) scale(1); }
        25% { transform: rotate(-8deg) scale(1.03); }
        75% { transform: rotate(8deg) scale(1.03); }
      }

      .chest-reveal { display: flex; flex-direction: column; align-items: center; position: relative; animation: revealPop 0.4s cubic-bezier(0.34,1.56,0.64,1); }
      @keyframes revealPop {
        0% { transform: scale(0.5); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }

      .confetti-wrap { position: absolute; top: -20px; left: 0; right: 0; height: 120px; pointer-events: none; }
      .confetti-bit { position: absolute; top: 0; width: 5px; height: 10px; border-radius: 1px; animation: confettiFall 1.1s ease-in forwards; }
      @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(110px) rotate(340deg); opacity: 0; }
      }

      .toast {
        position: fixed; bottom: 84px; left: 50%; transform: translateX(-50%);
        background: var(--bg-panel-alt); border: 1px solid var(--border);
        color: var(--text-primary); font-family: var(--font-body); font-size: 12px;
        padding: 10px 16px; border-radius: 10px; z-index: 999; max-width: 90%;
        box-shadow: 0 8px 24px -8px rgba(0,0,0,0.6);
        animation: toastIn 0.25s ease;
        text-align: center;
      }
      @keyframes toastIn {
        0% { opacity: 0; transform: translate(-50%, 8px); }
        100% { opacity: 1; transform: translate(-50%, 0); }
      }
      .forge-hit { animation: forgeHit 0.5s ease-in-out infinite; display: inline-block; }
      @keyframes forgeHit {
        0%, 100% { transform: rotate(0deg) scale(1); }
        30% { transform: rotate(-18deg) scale(1.06); }
        55% { transform: rotate(8deg) scale(0.96); }
      }

      .forge-glow { animation: forgeGlow 1s ease-in-out infinite; }
      @keyframes forgeGlow {
        0%, 100% { box-shadow: 0 0 0px rgba(212,175,106,0); }
        50% { box-shadow: 0 0 26px rgba(212,175,106,0.35); }
      }

      .forge-fail-shake { animation: forgeFailShake 0.4s ease; }
      @keyframes forgeFailShake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-6px); }
        40% { transform: translateX(6px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(4px); }
      }

      .toast-loot { border-color: #D4AF6A55; }
      .toast-warn { border-color: #C9425A55; color: #E8A5AF; }
      .toast-heal { border-color: #5FA8A055; }
      .toast-level { border-color: #4FC3D955; box-shadow: 0 8px 24px -6px #4FC3D955; }

      button { font-family: var(--font-body); cursor: pointer; }
      input, select { font-family: var(--font-body); }

      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
    `}</style>
  );
}
