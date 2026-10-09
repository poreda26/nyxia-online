// İstemci yapı numarası. Sunucu, `MIN_CLIENT_BUILD` (bkz. server/set-min-build.mjs) bundan büyükse bu istemciyi
// reddeder ve "güncelle" ekranı gösterilir. Eski kurallarla çalışan bir istemcinin sunucu ekonomisini bozmaması
// için, oyunun bir kural/API değişikliğinde bu sayı artırılır ve en düşük sürüm buna çekilir.
export const CLIENT_BUILD = 9;
