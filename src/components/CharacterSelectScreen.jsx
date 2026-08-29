import { useState } from "react";
import { Trash2, Plus, LogOut, Lock, Gem } from "lucide-react";
import { CLASSES } from "../data/classes";
import { RACES } from "../data/races";
import { CHARACTER_SLOTS, THIRD_SLOT_COST_DIAMONDS, CHARACTER_DELETE_COST_DIAMONDS } from "../utils/storage";
import { displayClassName } from "../utils/player";
import { styles } from "../styles";

export default function CharacterSelectScreen({ username, characters, unlockedSlots, onPlay, onCreate, onDelete, onUnlockSlot, onLogout }) {
  const [confirmingIdx, setConfirmingIdx] = useState(null);
  // Üç aşamalı silme onayı: "warn" (eşya/altın kaybı uyarısı) -> "final"
  // (son "emin misin" sorusu, artık elmas bedelini de gösterir) -> gerçek
  // silme. confirmingIdx null olunca ikisi de sıfırlanmış sayılır.
  const [confirmStep, setConfirmStep] = useState(null);
  const [unlocking, setUnlocking] = useState(false);
  const payerOptions = characters
    .map((p, idx) => ({ p, idx }))
    .filter(({ p }) => p && p.diamonds >= THIRD_SLOT_COST_DIAMONDS);

  return (
    <div style={styles.classSelectRoot}>
      <div style={styles.classSelectHeader}>
        <div style={styles.eyebrow}>{username.toUpperCase()}</div>
        <h1 style={styles.h1}>Karakterini seç.</h1>
        <p style={styles.subtext}>{unlockedSlots} karakter slotun var. Birini oyna, ya da boş bir slotta yeni bir karakter yarat.</p>
      </div>

      <div style={styles.slotList}>
        {Array.from({ length: CHARACTER_SLOTS }).map((_, idx) => {
          const p = characters[idx];

          if (idx >= unlockedSlots) {
            return (
              <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ ...styles.slotCard, borderStyle: "dashed", opacity: 0.7 }}>
                  <div style={styles.slotAvatar}>
                    <Lock size={16} color="var(--text-faint)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "var(--text-faint)" }}>Kilitli Slot</div>
                    <div style={{ fontSize: 9, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{THIRD_SLOT_COST_DIAMONDS} Elmas</div>
                  </div>
                  <button style={styles.tinyBtn} onClick={() => setUnlocking((v) => !v)}>Aç</button>
                </div>

                {unlocking && (
                  <div style={{ ...styles.itemDetailCard, marginTop: 0 }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 8 }}>
                      Bu slotu açmak için mevcut karakterlerinden birinin {THIRD_SLOT_COST_DIAMONDS} elmasını harcaman gerekiyor. Hangi karakter ödesin?
                    </div>
                    {payerOptions.length === 0 ? (
                      <div style={{ fontSize: 11, color: "#E8A5AF" }}>Hiçbir karakterinde yeterli elmas yok ({THIRD_SLOT_COST_DIAMONDS} gerekiyor).</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {payerOptions.map(({ p: payer, idx: payerIdx }) => (
                          <button
                            key={payerIdx}
                            style={{ ...styles.pickerRow, justifyContent: "space-between" }}
                            onClick={() => { onUnlockSlot(payerIdx); setUnlocking(false); }}
                          >
                            <span>{payer.nickname || displayClassName(payer)}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#8B6FC9", fontFamily: "var(--font-mono)" }}>
                              <Gem size={11} /> {payer.diamonds}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          }

          if (!p) {
            return (
              <div key={idx} style={{ ...styles.slotCard, borderStyle: "dashed", opacity: 0.7 }}>
                <div style={styles.slotAvatar}>
                  <Plus size={18} color="var(--text-faint)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "var(--text-faint)" }}>Boş Slot</div>
                </div>
                <button style={styles.tinyBtn} onClick={() => onCreate(idx)}>Karakter Oluştur</button>
              </div>
            );
          }

          const cls = CLASSES[p.class];
          const race = RACES[p.race];
          const Icon = cls.icon;
          const confirming = confirmingIdx === idx;
          const cancelDelete = () => { setConfirmingIdx(null); setConfirmStep(null); };

          return (
            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={styles.slotCard}>
                <div style={{ ...styles.slotAvatar, borderColor: cls.color }}>
                  <Icon size={20} color={cls.color} strokeWidth={1.6} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 14 }}>{p.nickname || displayClassName(p)}</div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                    {p.nickname ? `${displayClassName(p)} · ` : ""}Lv.{p.level} {race ? `· ${race.name}` : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "#E8A5AF" }}
                    onClick={() => { setConfirmingIdx(idx); setConfirmStep("warn"); }}
                  >
                    <Trash2 size={12} />
                  </button>
                  <button style={styles.tinyBtn} onClick={() => onPlay(idx)}>Oyna</button>
                </div>
              </div>

              {confirming && (() => {
                const canAfford = p.diamonds >= CHARACTER_DELETE_COST_DIAMONDS;
                return (
                  <div style={{ ...styles.itemDetailCard, marginTop: 0, borderColor: "#C9425A55", background: "#C9425A0d" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
                      {confirmStep === "warn"
                        ? `Karakteri silersen üstündeki tüm eşyaları ve altını kaybedersin. Silme bedeli ${CHARACTER_DELETE_COST_DIAMONDS} elmas.`
                        : "Karakteri silmek istediğine kesinlikle emin misin? Bu işlem geri alınamaz."}
                    </div>
                    {confirmStep === "final" && !canAfford && (
                      <div style={{ fontSize: 11, color: "#E8A5AF", marginTop: 6 }}>
                        Silmek için üzerinde en az {CHARACTER_DELETE_COST_DIAMONDS} elmas olmalı (şu an: {p.diamonds}).
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button style={{ ...styles.tinyBtn, background: "var(--bg-panel-alt)", color: "var(--text-muted)" }} onClick={cancelDelete}>Vazgeç</button>
                      <button
                        style={{ ...styles.tinyBtn, background: "#C9425A", ...(confirmStep === "final" && !canAfford ? { opacity: 0.5 } : {}) }}
                        disabled={confirmStep === "final" && !canAfford}
                        onClick={() => {
                          if (confirmStep === "warn") { setConfirmStep("final"); return; }
                          onDelete(idx);
                          cancelDelete();
                        }}
                      >
                        {confirmStep === "warn" ? "Devam Et" : `Evet, Sil (${CHARACTER_DELETE_COST_DIAMONDS} Elmas)`}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>

      <button
        style={{ ...styles.tinyBtn, background: "none", color: "var(--text-faint)", marginTop: 24, alignSelf: "center", display: "flex", alignItems: "center", gap: 6 }}
        onClick={onLogout}
      >
        <LogOut size={12} /> Çıkış Yap
      </button>
    </div>
  );
}
