// Row-major cells in the generated atlas. Names and combat data are unchanged.
export const STARTER_WEAPON_ART = Object.freeze({
 'Paslı Kılıç':0,'Short Blade':0,'Demir Balta':1,'Tahta Asa':2,'Wood Staff':2,
 'Çırak Asası':3,'Demir Uçlu Asa':4,'İpek Sarılı Asa':5,
 'Kızıl Rün Asası':6,'Kabuk Dokuma Asa':7,'Avcı Yayı':8,
});
const classicSheets={
 'classic-a':['Gökdev Baltası','Kara Diken','Yılan Ucu','Yırtıcı Pençe','Ayaz Balta','Buzul Kıran','Ateş Dili','Serap','Fırtına Ustası'],
 'classic-b':['Cehennem Kıran','Şimşek Yumruğu','Totem Topuzu','Kırıcı Gürz','Ağır Çekiç','Bambu Yay','Demir Arbalet','Zehir Dikeni','Çelik Yay'],
 'classic-c':['Köz Yayı','Yıldırım Teli',"Kartal Bakışı",'Arbalet','Boynuz Arbalet','Ayaz Yayı','Kavurucu Asa','Buzvaha Asası','Kaos Asası'],
 'classic-d':['Cehennem Kanı','Cennetbahçe','Poyraz','Gökkuşağı Asası',"Kadim Asa"],
};
const classicArt=Object.fromEntries(Object.entries(classicSheets).flatMap(([sheet,names])=>names.map((name,index)=>[name,{sheet:`${sheet}-weapons-v1`,index}])));
export function weaponIconArt(name){return STARTER_WEAPON_ART[name]!==undefined?{sheet:'starter-weapons-v1',index:STARTER_WEAPON_ART[name]}:classicArt[name]||null;}
