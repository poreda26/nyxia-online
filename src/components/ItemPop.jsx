import { useEffect, useRef, useState } from "react";

// Slotun içeriği (eşya ya da boş yer tutucu) değişince yumuşak bir animasyonla belirir:
// yeni eşya "pop" ile yerine oturur, çıkarılan slotta boş simge usulca geri gelir. İlk çizimde animasyon yoktur.
export default function ItemPop({ id, children }) {
  const previous = useRef(id);
  const [state, setState] = useState({ tick: 0, kind: "" });
  useEffect(() => {
    if (previous.current === id) return;
    previous.current = id;
    setState((s) => ({ tick: s.tick + 1, kind: id ? "item-pop" : "item-soft" }));
  }, [id]);
  return <span key={state.tick} className={state.kind} style={state.kind ? undefined : { display: "contents" }}>{children}</span>;
}
