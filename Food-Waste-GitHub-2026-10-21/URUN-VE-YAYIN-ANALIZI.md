# Food & Waste OS: ürün, AI ve yayın analizi

21 Ekim 2026. Bu belge mevcut kaynak kodu, çalışan yerel uygulama ve resmî teknik dokümantasyon üzerinden hazırlanmıştır. Müşteri talebi veya mevzuata uygunluk onayı değildir.

## Sonuç

İlk sürüm bir iş akışı prototipiydi. Sayfaya gelen kişinin nereden başlayacağını anlatmaması, AI işlemini görünür bir eyleme dönüştürmemesi ve belge saklamaması ürünün kullanılmasını zorlaştırıyordu. Başarılı bir model çağrısı bu eksikleri kapatmıyordu. Çok müşterili, internete açık bir SaaS veya mağazalarda yayımlanabilir mobil uygulama seviyesinde değildi.

Bu geliştirmede hedef: kullanıcının elle veya fotoğrafla kayıt oluşturabilmesi; kaydı, belgelerini ve eski kararlarını yeniden bulabilmesi; AI incelemesini başlatıp sonucunu takip edebilmesi. Şirket girişi ve erişim yalıtımı tamamlanmadan genel internet yayını yapılmamalı.

## Bulgular ve yapılan değişiklikler

| Alan | İlk sürümdeki sorun | Bu geliştirmedeki karşılık |
|---|---|---|
| İlk kullanım | Genel sayaçlar vardı; bir sonraki adım belirsizdi | Yönlendirmeli ana sayfa; elle giriş, fotoğraf ve AI için açık başlangıç eylemleri |
| Menü | İki düz düğme; yeni kayıt seçenekleri yoktu | Açılır yeni kayıt ve tesis menüleri; kayıt, belge ve AI alanları |
| Mobil görünüm | Tablo ve masaüstü yerleşimi dar ekranda sıkışıyordu | Kart listeleri, mobil menü, alt gezinme, esnek form ve dokunma alanları |
| Fotoğraf | Kamera veya görsel yükleme yoktu | Mobil kamera isteği ve galeriden/dosyadan seçim; önizleme ve kaldırma |
| Fotoğraftan bilgi | Metin modeli görselleri okuyamıyordu | Ayrı görsel model bağlantısı; etiketten alan taslağı çıkarma ve kullanıcı doğrulaması |
| Belge | Yalnızca belge adı/referansı tutuluyordu | Gerçek JPEG/PNG/WebP/PDF yükleme, kayıt ilişkisi, indirme ve SHA-256 özeti |
| Eski kayıt | Sınırlı liste vardı | Metin, durum ve tarih filtreleri; kapanmış kayıtlar; karar, teslim, belge ve işlem geçmişi sekmeleri |
| AI erişimi | AI ekranı çalıştırma geçmişiydi; başlatma için önce detay ekranını bulmak gerekiyordu | AI ekranında kayıt seçimi ve inceleme başlatma; ilgili kayda dönüş |
| AI bekleme | Uzun HTTP isteği sırasında sonuç görünmüyordu | Hızlı iş kabulü; arka planda çalışma; otomatik durum güncellemesi ve hata kaydı |
| Depolama | Tek JSON dosyası | PostgreSQL bağlantısı, kayıt/belge/ajan tabloları ve eski JSON'dan ilk aktarım |

## AI gerçekte ne yapıyor?

Sıfırdan temel model eğitmedik. Qwen3 8B adlı hazır metin modelini yerel Ollama servisi üzerinden, ürüne özgü talimatlarla çağırıyoruz. Ürünümüzün değeri; güvenilir kayıtlar, doğru iş akışı, belge bağlantıları ve insan onayıyla çalışan dar ajanlarda oluşacak.

Metin ajanı kaydı ve belge üst bilgilerini inceler. Ekli PDF veya fotoğrafların içeriğini otomatik okuduğu iddia edilmez. Görsel işleme ayrı bir işlemdir: Qwen3-VL 4B ile fotoğraftaki okunabilir alanlardan taslak çıkarılır. Okunamayan parti veya miktar boş kalmalı; kullanıcı onayı olmadan kayda dönüştürülmemeli. PDF OCR, çok sayfalı belge analizi ve kaynak gösteren mevzuat araması henüz yoktur.

İlk gerçek metin testinde kaynakta bulunmayan sıcaklık örneği ve zorunluluk bildiren ifadeler görüldü. Talimat daraltılarak bunlar azaltıldı; bu durum doğruluk garantisi sağlamaz. İlk çalıştırma ile model bellekteyken yapılan çalıştırmanın süresi farklıdır. Önceki tek örnekte görülen 2,8 saniye bütün istekler için hız vaadi değildir.

Yayın öncesinde en az şu örnek gruplarıyla ölçüm yapılmalı: eksik etiket, bulanık fotoğraf, birden fazla lot, yanlış miktar/birim, görsel içindeki kötü niyetli talimat, ilgisiz belge, belirsiz uygunsuzluk ve uydurulmuş mevzuat sorusu. Alan bazında çıkarım doğruluğu, boş bırakılması gereken alanlar, insan düzeltmesi ve yanlış güvenlik/atık kararları ayrı ölçülmeli.

Şu anda görevler tek Node sürecinde yürür. Süreç yeniden başlarsa yarım kalan iş başarısız işaretlenir. Üretimde kalıcı iş kuyruğu, ayrı worker, deneme sınırı, idempotency ve zaman aşımı politikası gerekir. Aynı anda tek AI işlemi sınırı yerel GPU'nun aşırı yüklenmesini azaltır; çok sunuculu kuyruk yerine geçmez.

## PostgreSQL ve belge mimarisi

Yerel PostgreSQL yalnızca 127.0.0.1:5433 üzerinde çalışır. Veri dizini OneDrive'dan ayrı, kullanıcının yerel uygulama klasöründedir. Uygulama hesabı superuser değildir. Parola `.env` içinde, Git dışında tutulur. Eski `data/store.json` ilk aktarımda okunur; silinmez veya üstüne PostgreSQL verisi yazılmaz. DATABASE_URL yapılandırılmışken bağlantı başarısız olursa JSON'a sessizce geçilmez.

`app_records`: parti/ürün/durum/tarih ve iş akışı alanları. `app_documents`: kayıt ilişkisi, ad, tür, boyut, dosya anahtarı ve SHA-256. `app_runs`: kayıt ilişkisi ve AI işlem sonucu. İşlem geçmişi kayıt içeriğinde tutulur. JSONB, henüz değişen alanların hızla geliştirilmesi için kullanılıyor; tüm iş alanları nihai ilişkisel şemaya dönüştürülmüş değildir.

Dosyalar şimdilik `data/documents` altında yerel disktedir. Rastgele dosya anahtarları kullanılır. İndirme sırasında dosya veritabanında aranır; kullanıcının gönderdiği yol doğrudan açılmaz. Dosya türü yalnızca uzantıya göre kabul edilmez. Dosya başına 8 MB ve işlem başına dört dosya sınırı vardır. Bunlar tam zararlı yazılım taraması veya bütün dosya yapısının doğrulanması anlamına gelmez.

Üretimde özel S3 uyumlu nesne deposu, şirket bazında anahtarlar, sunucuda erişim denetimi, kısa ömürlü indirme bağlantıları, zararlı yazılım karantinası, sürümleme ve saklama politikası gerekir. Dosya ve veritabanı yedekleri birlikte alınmalı; tek başına SQL yedeği belge dosyalarını kurtarmaz. SHA-256 dosyanın aynı kaldığını denetler; yedekleme veya kimlik doğrulama sağlamaz.

Mevcut veri katmanı tüm kayıtları okuyarak çalışıyor. Üretim ölçeğinde sayfalama, sunucuda filtreleme, kayıt bazında güncelleme ve sorgu sınırları eklenmeli. PostgreSQL kullanmak tek başına ölçeklenebilirlik veya şirket yalıtımı sağlamaz.

## Web, Android ve iOS yolu

Öneri: ortak API + mobil uyumlu web istemcisi + Capacitor tabanlı Android/iOS uygulamaları. İlk aşamada aynı iş akışını üç ayrı kod tabanında yeniden yazmayalım. Kamera, güvenli oturum saklama ve bildirim ihtiyaçları native katmanda ele alınabilir.

Webde `capture="environment"` destekleyen cihazlarda arka kamera seçimi istenir. Bazı tarayıcılar bunun yerine dosya seçiciyi açabilir; bu yüzden galeri/dosya seçme alternatifi korunur. HEIC şu sürümde kabul edilmez; JPEG/PNG/WebP kullanılmalıdır. Gerçek iPhone/Safari ve Android/Chrome kamera testleri ayrıca yapılmalı.

Manifest eklendi; bu, tamamlanmış PWA veya App Store/Google Play paketi demek değildir. Çevrimdışı veri kuyruğu, güvenli senkronizasyon ve native paketler henüz yoktur. Windows'ta web ve Android geliştirmesi yapılabilir. iOS derleme ve imzalama için Mac/Xcode veya uygun macOS CI gerekir. Mağaza hesapları, gizlilik beyanları, kamera kullanım açıklamaları, ekran görüntüleri ve inceleme süreci ayrıca tamamlanmalıdır.

Telefon, kendi üzerindeki 127.0.0.1 adresinden bu bilgisayara bağlanamaz. Şu anki bağlantı yalnızca bilgisayar içindir. Telefon erişimi için kimlik doğrulamalı ve HTTPS kullanan test ortamı hazırlanmalı. Hazır olmayan yerel servisi internete açmak çözüm değildir.

## Yayın engelleri ve sıra

1. Kullanıcı girişi, güvenli oturumlar ve parola sıfırlama. Şirket/tesis üyelikleri ve rol matrisi: yönetici, kalite sorumlusu, saha kullanıcısı ve salt okunur denetçi.
2. Her kayıt, belge ve AI işi için sunucuda şirket yetkisi kontrolü. Başka şirketin kimliğini kullanarak erişimin reddedildiği negatif testler. Danışman erişimi açık üyelikle tanımlanmalı.
3. İşlem geçmişini ayrı eklemeli olay yapısına taşıma, karar düzeltme süreci ve silme/saklama kuralları. Mevcut geçmiş değiştirilemez denetim kanıtı diye sunulamaz.
4. HTTPS, güvenli cookie/CSRF, hız sınırları, erişim günlükleri, dosya karantinası ve özel nesne deposu. Kimlik doğrulama eklenmeden CORS'u genişletme veya sunucuyu dış arayüzlere açma yok.
5. Veritabanı ve belgeler için yedekleme, bağımsız geri yükleme denemesi, izleme ve hata uyarıları. Üretim verisi ve demo verisi ayrılmalı.
6. Model worker'ı web sunucusundan ayırma. Müşterinin işlemi geliştiricinin dizüstü bilgisayarının açık olmasına bağlı kalmamalı. Bulut GPU ile harici model API'si seçenekleri gerçek iş yüküyle maliyetlendirilmelidir.
7. Erişilebilirlik ve 360/390/768/1440 px ekran testleri; gerçek cihazda kamera, büyük dosya, yavaş ağ, başarısız AI ve yeniden deneme senaryoları.
8. Önce sınırlı web pilotu; ardından Android kapalı test ve iOS TestFlight. Gerçek müşteri/mağaza onayı olmadan tamamlanmış ticari ürün iddiası yok.

Başlangıçtaki 5.000 TL geliştirme bütçesi, sürekli çalışan bulut GPU'su, güvenlik çalışması ve mağaza yayını için doğrulanmış toplam maliyet değildir. Yayın bütçesi seçilen altyapı ve kullanım ölçümünden sonra ayrıca hesaplanmalıdır.

## Bu turda doğrulanan sonuçlar

- PostgreSQL'e aktarım: önceki 1 parti ve 3 AI çalıştırması korundu. Sentetik uçtan uca test ayrıca 1 kapanmış kayıt ve 1 PNG ekledi.
- 14 birim testi geçti: iş kararı, teslim sınırları, metin uzunluğu, takvim tarihi, dosya boyutu, base64, tür imzası ve ad temizleme.
- Fotoğraflı kayıt → dosyayı geri indirme ve SHA-256 eşleşmesi → karar → teslim → kapanmış kayıt geçmişi akışı geçti.
- Arka plan metin ajanı testi 7,2 saniyede tamamlandı; ilgili parti değişmedi.
- İlk görsel testte boş yanıt alındı. Yanıt sınırı ve çıkarım talimatı düzeltildikten sonra gerçek görsel test 10 saniyede geçti: LOT-2026-052, YOGURT, 25 kg. Sonuç insan kontrolü gerektiren taslak kaldı; kayıt otomatik oluşturulmadı.
- PostgreSQL yedeği bağımsız test veritabanına geri yüklendi. Kayıt, belge ve AI tablolarındaki bütün satırlar özgün verilerle karşılaştırıldı ve eşleşti. Test veritabanı sonrasında kaldırıldı.
- Veritabanı ve yerel belge dosyaları birlikte yedeklendi. Bu, bağımsız bir sunucuda felaket kurtarma testi değildir.
- 390 px genişlikte gerçek tarayıcı iframe görünümünde mobil menü açma/kapama, kayıt ekranına geçme, kapanmış kaydı ve işlem geçmişini açma, yeni kayıt açılır menüsü ve fotoğraf formu kontrol edildi. Masaüstü ana ekranı ve AI kayıt seçimi de kontrol edildi.
- Metin incelemesi tarayıcı arayüzünden de başlatıldı; önce Çalışıyor durumu, ardından sonuç otomatik görüntülendi.
- Fiziksel iPhone/Android kamerası, gerçek cihaz izinleri, mağaza paketi ve çevrimdışı senkronizasyon bu turda test edilmedi. 360/768 px kapsamlı görsel kontroller de henüz tamamlanmadı.

## Teknik kaynaklar

- [PostgreSQL Windows dağıtımı](https://www.postgresql.org/download/windows/)
- [Parametreli PostgreSQL sorguları](https://node-postgres.com/features/queries)
- [Mobil kamera capture niteliği](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/capture)
- [Ollama görsel model API'si](https://docs.ollama.com/capabilities/vision)
- [Qwen3-VL 4B model bilgisi](https://ollama.com/library/qwen3-vl:4b)
- [Capacitor dokümantasyonu](https://capacitorjs.com/docs)
