import {styles} from '../styles';


// Kullanıcı isteği: "Tüm oyunda önceki sonraki diye sayfalar olmayacak.
// Tamamen kaydırmalı sistem yap." — önceki "sayfa sayfa ilerle" mantığı
// (ResizeObserver ile içeriği ekran boyuna göre dilimleyip Önceki/Sonraki
// düğmeleriyle gezdirme) tamamen kaldırıldı. Her ekran artık battle/
// inventory ile aynı şekilde düz kaydırmalı. `data-screen` niteliği
// BattleScene.css'in [data-screen] seçicileri için korunuyor, DOM
// yerleşimi de (viewport > content > children) o CSS'in beklediği
// iç içelikle birebir aynı kalıyor.
export default function ScreenPanel({children,screen}) {
 return <div style={{flex:1,minHeight:0,display:'flex',flexDirection:'column'}}>
  <div data-screen={screen} style={{...styles.tabContent,minHeight:0,overflowX:'hidden',overflowY:'auto'}}>
   <div>{children}</div>
  </div>
 </div>;
}
