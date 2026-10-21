# Food & Waste OS — v0.2

Elle veya fotoğrafla uygunsuzluk kaydı, belge arşivi, parti geçmişi ve yerel AI ajanı içeren geliştirme sürümü.

## Açılış

Windows'ta `BASLAT.cmd` dosyasını çalıştırın ve http://127.0.0.1:3100 adresini açın. Mevcut yerel PostgreSQL kümesini gerektiğinde başlatır. Ollama uygulaması da çalışır durumda olmalıdır. Komut satırı alternatifi: `node server.mjs` (Node.js 22+).

Yeni bilgisayarda bağımlılıkları `pnpm install --frozen-lockfile` ile kurun. `.env.example` dosyasını `.env` olarak kopyalayın. PostgreSQL bağlantısını ve model adlarını düzenleyin. DATABASE_URL ayarı yoksa yalnızca geliştirme amaçlı JSON deposu kullanılır; arayüz hangi deponun çalıştığını gösterir. Ayar varken PostgreSQL bağlantısı başarısızsa JSON'a sessizce geçilmez.

## Ekranlar

- Genel bakış: elle kayıt, fotoğraf ve AI için başlangıç eylemleri.
- Kayıtlar: metin/durum/tarih filtreleri; karar, belge, AI ve işlem geçmişi sekmeleri.
- Belge arşivi: kayda bağlı fotoğraf ve PDF'leri arama ve indirme.
- AI asistanı: kayıt seçip incelemeyi başlatma; canlı bağlantı, iş durumu, sonuç ve hata gösterimi.

Güncel menü adları: Operasyon özeti, Parti kayıtları, Belge arşivi ve Akıllı inceleme. Üst alandaki arama parti/ürün/belge sonuçlarını ilgili dosyada açar. Ürün tanıtımı `/#product`, güven ve veri ilkeleri `/#trust` adresindedir. Tasarım ve önerilen yatırımcı demosu [TASARIM-VE-DEMO.md](TASARIM-VE-DEMO.md) dosyasında açıklanır.

Fotoğraf formu mobil cihazda kamera veya galeri seçiminden sonra görsel modelle alanları taslak doldurabilir. Kullanıcı kontrolü olmadan kayıt oluşturulmaz. Kamera açılışı tarayıcıya bağlıdır. JPEG, PNG, WebP ve PDF ekleri en fazla 8 MB; bir işlemde en fazla dört dosya. HEIC ve PDF'den otomatik alan çıkarma şu anda desteklenmez.

## Yerel modeller

```powershell
ollama pull qwen3:8b
ollama pull qwen3-vl:4b
```

Metin modeli kayıt üstünden eksik bilgi ve kontrol önerileri üretir. Görsel model fotoğraftaki etiketten alan taslağı çıkarır. Mevzuat kararı veya otomatik atık kodu atamazlar. Ekli belgeler metin ajanı tarafından otomatik okunmaz. Modelin indirilmesi, doğru cevap vereceğini garanti etmez.

`.env` değişkenleri: PORT, OLLAMA_MODEL, OLLAMA_VISION_MODEL, OLLAMA_URL, DATABASE_URL. Yerel varsayılan Ollama adresi http://127.0.0.1:11434 . Harici model adresi verilirse içerik o adrese gönderilir. Sırlar Git'e eklenmez.

## Veri ve yedek

Yerel PostgreSQL çalıştırılabilir dosyaları `%LOCALAPPDATA%/FoodWaste/postgresql`, verisi `%LOCALAPPDATA%/FoodWaste/postgres-data` altında; OneDrive dışında tutulur. Uygulama bağlantısı 127.0.0.1:5433 üzerindedir. Geliştirme kurulum yardımcısı `setup-local-db.ps1`; resmî Windows paketi `.local/postgresql/pgsql` konumuna çıkarıldıktan sonra çalıştırılır. Yardımcı rastgele parola ve superuser olmayan uygulama rolü oluşturur.

Mevcut JSON kayıtları boş PostgreSQL veritabanına ilk açılışta aktarılır; eski dosya silinmez. Belgeler `data/documents` içindedir; metadata ve SHA-256 PostgreSQL'de tutulur. Kayıt/ajan alanlarının bir bölümü JSONB biçimindedir. Sonraki aşamada şirket ilişkileri ve sunucuda sayfalama eklenecektir.

Yazma işlemi yapılmayan bir bakım aralığında `./backup.ps1` veritabanını ve belgeleri birlikte `backups` klasörüne kopyalar. Veritabanı yedeği tek başına belge dosyalarını içermez. Yerel backup klasörü bağımsız felaket kurtarma ortamı değildir; üretimde ayrı ve şifreli hedef gerekir.

## Doğrulama

```powershell
node --test
node verify-workflow.mjs
node verify-ai.mjs
node verify-photo.mjs
node verify-restore.mjs
```

İlk komut birim testlerini çalıştırır. Diğerleri çalışan yerel uygulama/veritabanı gerektirir; sentetik test kaydı veya AI geçmişi oluşturabilir. Fotoğraf testi `test-results/label.png` sentetik etiketini kullanır. Geri yükleme testi kendi geçici veritabanını oluşturur, bütün satırları karşılaştırır ve yalnızca kendi oluşturduğu test veritabanını kaldırır. Yerel yönetici parolasını `.local/pg-admin-secret` dosyasından okur.

## Yayın ve mobil sınırı

Bu sürümde kullanıcı girişi, şirket yalıtımı ve rol denetimi henüz yoktur. İnternete açmayın. Web uygulaması mobil düzenler ve manifest içerir; native Android/iOS paketi, çevrimdışı senkronizasyon veya tamamlanmış PWA değildir. Telefonda 127.0.0.1 bilgisayarınızı göstermez. HTTPS ve kimlik doğrulamalı test ortamı gereklidir.

Ürün, AI, güvenlik ve mağaza yayınına ilişkin bulgular ve sıralı plan: [URUN-VE-YAYIN-ANALIZI.md](URUN-VE-YAYIN-ANALIZI.md).
# Geri bildirim ve ajan modülü

Yerel demoda `/#feedback` ekranı: onaylı geri bildirim kaydı → iki gerçek model çağrısı → görev taslağı → insan onayı → takip görevi ve sonuç geçmişi. Kullanım, testler ve sınırlar için [GERI-BILDIRIM-DURUMU.md](GERI-BILDIRIM-DURUMU.md). Henüz şirket/kullanıcı yetkilendirmesi veya harici eklenti dağıtımı yoktur.

## ChatGPT MCP bağlantısı

`BASLAT-CHATGPT.cmd`, ayrı ve yalnızca yerel `127.0.0.1:3102/mcp` sunucusunu başlatır. Beş araç yalnızca bağlantıdan oluşturulan geri bildirimlerle çalışır. ChatGPT web hesabına bağlamak için özel tünel veya uygun HTTPS dağıtımı gerekir; otomatik etkinleştirme yapılmadı. Elle kurulum: [CHATGPT-KURULUM.md](CHATGPT-KURULUM.md).

