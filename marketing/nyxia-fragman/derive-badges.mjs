// Resmi rozet dosyalarından yalnızca "indirin" çağrı yazısını çıkarır; ikon, wordmark ve çerçeve aynen kalır, wordmark dikeyde ortalanır.
// Girdi (badges/ klasöründe, depoda YOK, resmi kaynaklardan indirilir):
//   Download_on_the_App_Store_Badge_EN_black.svg  <- https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/en-us
//   GetItOnGooglePlay_Badge_Web_color_Turkish.svg <- Google Partner Marketing Hub (Get it on Google Play Badges > Digital > svg)
// Çıktı: AppStore_icon_noCTA.svg, GooglePlay_icon_noCTA.svg (Instagram gibi kendi kanallarımız içindir, mağaza reklamı için değil).
import{readFileSync,writeFileSync}from'node:fs';import{fileURLToPath}from'node:url';
const dir=fileURLToPath(new URL('./badges/',import.meta.url));
let a=readFileSync(dir+'Download_on_the_App_Store_Badge_EN_black.svg','utf8');
const paths=[...a.matchAll(/<path[\s\S]*?\/>/g)].map(m=>({text:m[0],index:m.index}));
if(paths.length!==25)throw Error('Apple path sayısı beklenen 25 değil: '+paths.length);
let out='',last=0;
paths.forEach((p,i)=>{out+=a.slice(last,p.index);last=p.index+p.text.length;
 if(i>=12)return;                                   // 12-24: "Download on the" yazısı
 out+=(i>=4)?p.text.replace('<path','<path transform="translate(0,-5.5)"'):p.text;}); // 4-11: "App Store" wordmark
out+=a.slice(last);
out=out.replace(/<title>[^<]*<\/title>/,'<title>App Store (resmi rozetten, çağrı yazısı çıkarıldı)</title>');
writeFileSync(dir+'AppStore_icon_noCTA.svg',out);
let g=readFileSync(dir+'GetItOnGooglePlay_Badge_Web_color_Turkish.svg','utf8');
g=g.replace(/\s*<g class="st1">\s*<path[\s\S]*?\/>\s*<\/g>/g,'');            // "İNDİRİN" yazısı (7 grup)
if((g.match(/class="st1"/g)||[]).length!==0)throw Error('st1 grupları tamamen çıkarılamadı');
g=g.replace('<path class="st5" d="M120.61,38.5','<path class="st5" transform="translate(0,-10)" d="M120.61,38.5'); // "Google Play" wordmark
if(!g.includes('translate(0,-10)'))throw Error('wordmark bulunamadı');
writeFileSync(dir+'GooglePlay_icon_noCTA.svg',g);
console.log('rozetler hazır');
