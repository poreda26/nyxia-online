import { Sparkles } from "lucide-react";

// data/scheduledEvents.js kasıtlı olarak saf JS (bkz. kendi dosyasındaki
// not) — sunucudan da (bkz. server/app.mjs'teki etkinlik hatırlatma push
// bildirimi) doğrudan import edilebilsin diye lucide-react'e hiç bağımlı
// değil. İkon eşlemesi bu yüzden ayrı, sadece istemcinin kullandığı bu
// dosyada — event.id'ye göre.
export const SCHEDULED_EVENT_ICONS = {
  noon_exp_rush: Sparkles,
};
