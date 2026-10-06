# Oracle Cloud (Always Free) taşıma rehberi

Hedef: oyunu evdeki sunucudan Oracle'ın ücretsiz ARM makinesine taşımak. Uygulama dosyaları, Node, HTTPS (Caddy), güvenlik duvarı, servis ve günlük yedek
betikler tarafından kurulur; senin yapacağın kısım yalnızca Oracle panelinde makineyi açmak ve DNS kaydını değiştirmek.

## 1. Oracle hesabı ve makine (senin yapacağın kısım, ~15 dk)
1. https://www.oracle.com/cloud/free/ → hesap aç (kredi kartı doğrulaması ister, ücret çekmez). **Ana bölge: Germany Central (Frankfurt)** seç, sonradan değişmez.
2. Compute → Instances → **Create instance**
   - Ad: `nyxia`
   - Image: **Canonical Ubuntu 24.04** (aarch64 / ARM)
   - Shape: **Ampere → VM.Standard.A1.Flex**, **2 OCPU, 12 GB RAM** ("Always Free-eligible" yazmalı)
   - Boot volume: **50 GB**
   - Networking: yeni VCN, **Assign a public IPv4 address** açık
   - SSH keys → "Paste public keys" → şunu yapıştır (bu bilgisayardaki herkese açık anahtar, gizli değil):
     ```
     ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBOuHcB7NjXhpI1olH0v7rAwmbeRDc2tYclDGlbjR+C1 claude-code-nyxia-deploy
     ```
   - "Out of capacity" hatası alırsan birkaç saat sonra ya da başka bir availability domain ile tekrar dene.
3. Instance sayfasında **Public IP** adresini not et.
4. VCN → Security Lists → Default → **Add Ingress Rules**: Source `0.0.0.0/0`, TCP, hedef portlar **80** ve **443**. (SSH 22 zaten açık.)
5. Public IP'yi bana yaz.

## 2. Taşıma (ben yaparım)
```bash
bash deploy/oracle/migrate.sh prepare <YENI_IP>   # kurulum; oyun eski sunucuda çalışmaya devam eder
bash deploy/oracle/migrate.sh cutover <YENI_IP>   # eskiyi durdurur, son veritabanını taşır, yenisini başlatır
```
Kesinti: yalnızca `cutover` ile DNS değişimi arası (birkaç dakika). Öncesinde DNS sağlayıcında `nyxia.sametcantas.com` A kaydının **TTL**'ini 300 saniyeye çek.

## 3. DNS
`cutover` bitince `nyxia.sametcantas.com` A kaydını yeni IP'ye çevir. Caddy HTTPS sertifikasını DNS değişince kendisi alır (1–3 dk).
Kontrol: `curl https://nyxia.sametcantas.com/api/health`

## 4. Sonrası
- Oturumlar ve bütün oyuncu verisi veritabanıyla birlikte taşınır; oyuncular yeniden giriş yapmaz. Android uygulaması aynı adresi kullandığı için yeni APK gerekmez.
- Günlük yedek: `/home/nyxia/data/backups` (son 14). İsteğe bağlı: bu klasörü Oracle Object Storage'a (20 GB ücretsiz) kopyalat.
- Güncelleme dağıtımı: `/etc/nyxia/env` içindeki değerler değişmez; yeni sürüm için `migrate.sh prepare` yeniden çalıştırılabilir ya da dosyalar `/home/nyxia/apps/nyxia-online` altına kopyalanıp `sudo systemctl restart nyxia-backend` yapılır.
- Eski sunucuyu bir hafta açık tut (geri dönüş için), sonra kapat.

## Geri dönüş
Eski sunucuda `systemctl --user start nyxia-backend` ve DNS'i eski IP'ye çevir. **Dikkat:** yeni sunucuda yapılan oyuncu ilerlemesi eskiye taşınmaz.
