// Canavar/boss görünen-ad çevirileri + ırk açıklamaları — data/maps.js,
// data/mapBosses.js, data/soloDungeon.js ve data/races.js Türkçe kaynak
// metni DEĞİŞTİRİLMEDEN kalıyor (loot tabloları, görev canavar-id eşlemeleri
// ve silah/zırh yeniden-adlandırma scriptinin varsayımlarını bozmamak için).
// Bunun yerine bu dosya, id'ye göre bir görünen-ad çeviri katmanı sağlıyor:
// LanguageContext.jsx'teki translateMonsterName()/tm() bu sözlüğe DOĞRUDAN
// bakıyor (t() üzerinden değil). `races` alt-alanı ise normal t() yoluyla
// okunuyor (bkz. RaceSelect.jsx#t(`races.${key}.desc`)) — translations.js'e
// `...monstersSection.tr/en` ile spread edildiğinde `monsters` ve `races`
// İKİSİ DE ayrı, top-level namespace olarak açılıyor (monsters İÇİNDE bir
// races alt-alanı DEĞİL) — RaceSelect.jsx bir ara `monsters.races.${key}.
// desc` diye yanlış (iç içe varsayan) bir yoldan okuyordu, bu da ekranda ham
// anahtar dizesini gösteriyordu; düzeltildi.
export const monstersSection = {
  tr: {
    // Canavar/boss id -> görünen ad. Türkçe için BOŞ bırakılıyor çünkü
    // Türkçe ad zaten data/maps.js & mapBosses.js & soloDungeon.js'teki
    // `name` alanının kendisi — translateMonsterName() Türkçe'de her zaman
    // çağıranın verdiği fallbackName'i (yani o orijinal `name` alanını)
    // döndürüyor, bu sözlüğe hiç bakmıyor.
    monsters: {},
    races: {
      karus: {
        name: "Ork",
        desc: "Savaşçı ruhlu, disiplinli bir ordu milleti. Kızıl bayrak altında birleşir.",
      },
      elmorad: {
        name: "İnsan",
        desc: "Zarif, stratejik düşünen bir bilgelik milleti. Gümüş ay altında yürür.",
      },
    },
  },
  en: {
    monsters: {
      // Fallow Valley
      sis_kurdu: "Mist Wolf",
      kabuklu_golem: "Shell Golem",
      otlak_yabanisi: "Meadow Savage",
      bataklik_surungeni: "Swamp Crawler",
      nadas_devi: "Fallow Giant",
      // Ashen Canyon
      kul_yaratigi: "Ashen Wretch",
      volkan_suru: "Volcanic Serpent",
      kanyon_akrebi: "Canyon Scorpion",
      lav_ruhu: "Lava Spirit",
      // Frostburn Summit
      buzul_kurdu: "Glacier Wolf",
      alev_orumcegi: "Flame Spider",
      don_devi: "Frost Giant",
      kor_salamanderi: "Ember Salamander",
      zirve_muhafizi: "Summit Warden",
      // Ruined Sanctuary
      harabe_iskeleti: "Ruin Skeleton",
      lanetli_rahip: "Cursed Priest",
      tapinak_bekcisi: "Temple Sentinel",
      golge_vaizi: "Shadow Preacher",
      // Abyssal Pit
      ucurum_solucani: "Abyssal Worm",
      karanlik_cagirici: "Dark Summoner",
      dip_iblisi: "Pit Fiend",
      kabus_golgesi: "Nightmare Shade",
      ucurum_efendisi: "Abyssal Lord",
      // Crimson Battlefront
      kizil_muhafiz: "Crimson Guard",
      alev_cellati: "Flame Executioner",
      kaos_iblisi: "Chaos Demon",
      kiyamet_ejderha: "Doomsday Dragon",
      // Map-end bosses (data/mapBosses.js#buildMapBoss — id: `map_boss_${map.id}`)
      map_boss_fallow_valley: "Fallow Valley Guardian",
      map_boss_ashen_canyon: "Ashen Canyon Guardian",
      map_boss_frostburn_summit: "Frostburn Summit Guardian",
      map_boss_ruined_sanctuary: "Ruined Sanctuary Guardian",
      map_boss_abyssal_pit: "Abyssal Pit Guardian",
      map_boss_crimson_battlefront: "Crimson Battlefront Guardian",
      // Solo Dungeon final bosses (data/soloDungeon.js#buildSoloDungeonStages —
      // id: `dungeon_${map.id}_boss`). The 5 regular per-map stages reuse a
      // real monster's name with a Turkish "(Zindan N)" suffix BAKED INTO the
      // string in soloDungeon.js itself, so they can't be keyed/translated
      // here without editing that file (out of scope, see report).
      dungeon_fallow_valley_boss: "Fallow Valley Dungeon Lord",
      dungeon_ashen_canyon_boss: "Ashen Canyon Dungeon Lord",
      dungeon_frostburn_summit_boss: "Frostburn Summit Dungeon Lord",
      dungeon_ruined_sanctuary_boss: "Ruined Sanctuary Dungeon Lord",
      dungeon_abyssal_pit_boss: "Abyssal Pit Dungeon Lord",
      dungeon_crimson_battlefront_boss: "Crimson Battlefront Dungeon Lord",
      // Warzone world boss (data/warzone.js#WORLD_BOSS)
      meydan_cellati: "Arena Executioner",
    },
    races: {
      karus: {
        name: "Orc",
        desc: "A disciplined warrior nation with a soldier's spirit. United beneath the crimson banner.",
      },
      elmorad: {
        name: "Human",
        desc: "A graceful nation of strategic wisdom. They walk beneath the silver moon.",
      },
    },
  },
};
