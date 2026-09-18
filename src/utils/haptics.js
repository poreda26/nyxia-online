// Native touch feedback for the moments audio/sfx.js already treats as the
// game's emotional beats (hit/crit, taking damage, upgrade success/fail,
// level up) — wired in there so every existing sound call gets a matching
// vibration for free. Fire-and-forget: haptics must never be able to break
// combat/reward flow on a platform or browser that doesn't support it.
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

function safe(fn) {
  try {
    const result = fn();
    if (result && typeof result.catch === "function") result.catch(() => {});
  } catch {
    // unsupported platform — ignore
  }
}

export function hapticHit(crit = false) {
  safe(() => Haptics.impact({ style: crit ? ImpactStyle.Heavy : ImpactStyle.Light }));
}

export function hapticHurt() {
  safe(() => Haptics.impact({ style: ImpactStyle.Medium }));
}

export function hapticSuccess() {
  safe(() => Haptics.notification({ type: NotificationType.Success }));
}

export function hapticError() {
  safe(() => Haptics.notification({ type: NotificationType.Error }));
}

export function hapticLevelUp() {
  safe(() => Haptics.impact({ style: ImpactStyle.Heavy }));
}
