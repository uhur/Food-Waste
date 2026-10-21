# Pilot hazırlığı ve şirket modeli

21 Ekim 2026. Kaynak kodu incelemesine dayanan uygulama planı. Aşağıdaki hedefler uygulanmış özellik veya güvenlik onayı değildir. Gerçek müşteri pilotu için henüz hazır değiliz.

## Hesap ve yetki modeli

Abonelik ve verinin sahibi şirket; giriş yapan kişi bireysel kullanıcıdır. Şirketin bir veya daha fazla tesisi olabilir. Kullanıcı bir şirkete davetle katılır; danışman birden fazla şirkete ayrı üyeliklerle erişebilir. Şirket seçimi sunucuda üyelikle doğrulanır. İstemciden gelen şirket kimliğine güvenilmez.

Pilot davetli olacak. Roller: şirket yöneticisi (üyelik ve tesis), kalite sorumlusu (inceleme/karar/kapanış), saha kullanıcısı (kayıt/kanıt), denetçi (atanan kapsamda salt okuma). Rol adı tek başına yeterli değil; işlem ve tesis bazında sunucu denetimi gerekir. Platform desteği varsayılan olarak müşteri belgelerini görememeli; istisnai erişim süreli, gerekçeli ve kayıtlı olmalı.

## Bugünkü durum

- PostgreSQL kalıcı kayıt, belge üst bilgisi ve AI çalıştırmalarını saklıyor. Gerçek dosyalar yerel diskte. SQL sorguları parametreli.
- HTTP uygulaması ve PostgreSQL yerel bağlantıya bağlı. CSP, içerik türü koruması, POST kaynak kontrolü, dosya tür imzası/boyutu/adı kontrolü var. Bunlar kimlik doğrulama yerine geçmez.
- Giriş, oturum, şirket/tesis yalıtımı, rol denetimi ve kullanıcıya bağlı denetim günlüğü yok. Yerel API'ye erişen kişi bütün mevcut kayıtları görebilir; belge kimliğini bilmek yetki kontrolü değildir.
- Veritabanı hesabı superuser değil; ancak mevcut uygulama şemayı da oluşturuyor. Üretimde migration hesabı ile çalışma hesabı ayrılmalı.
- Yedek ve geçici veritabanına geri yükleme daha önce denendi; otomatik, bağımsız ve şifreli üretim yedekleri kurulmadı.
- AI yerel Ollama'ya gider; kaydı veya seçilen görseli işler. Şirket bazında AI kapsamı ve üretim saklama politikası kurulmadı. Yerel çalıştırma veri sızmayacağı garantisi değildir.
- Android/iOS kaynak projeleri, imzalı paketler ve fiziksel cihaz testleri yok. Web manifesti mağaza uygulaması değildir.

## Veri hedefi

Tablolar: companies, users, memberships, facilities, facility_memberships, sessions, invitations, records, decisions, deliveries, documents, tasks, ai_jobs ve audit_events. Tesis kapsamı üyelik üzerinden tanımlanmalı. Şirkete ait tablolarda company_id bulunmalı; ilişkiler bileşik anahtar/yabancı anahtarlarla şirket sınırını korumalı.

API her istekte kullanıcı ve kapsamı denetler. PostgreSQL RLS ikinci katman olur; uygulama hesabı tablo sahibi/superuser/BYPASSRLS olmamalı. Bağlantı havuzunda şirket bağlamı transaction kapsamında kurulmalı. Migration önce yedekle, eski kayıtları açıkça demo şirketine ata, aktarım adetlerini ve dosya özetlerini doğrula; veriyi silme.

Mevcut tüm kayıtları okuyup yeniden kaydetme yaklaşımı yerini kapsamlı, sayfalı sorgulara ve kayıt bazında işlemlere bırakmalı. Eşzamanlı güncellemelerde sürüm kontrolü; yeniden gönderilen isteklerde çift işlem önleme gerekir.

Belgelerin kendisi özel nesne deposunda; dosya anahtarı, sahip şirket/kayıt, tür, özet ve sürüm PostgreSQL'de saklanmalı. Her indirmede yetki kontrolü yapılmalı; gerekiyorsa kısa süreli imzalı bağlantı verilmeli. Yüklemeler karantinadan geçmeli. Depo, yedek ve bağlantı şifrelemesi; ayrı anahtar yönetimi; saklama/silme ve geri yükleme süreçleri birlikte tasarlanmalı.

AI işleri kullanıcı/şirket/tesis kapsamını taşımalı; yalnızca izinli veri modele gönderilmeli. AI çıktısı veri ve yetki sınırlarını aşamamalı. Kaynak belgeler, model sürümü ve insan onayı izlenmeli; şifreler ve gereksiz kişisel bilgiler prompt veya günlüklere girmemeli.

## Pilot kabul kapıları

1. Giriş, doğrulanmış davet, güvenli oturum, hesap kurtarma ve yönetici MFA; HTTPS, istek sınırları, güvenli hata mesajları.
2. İki sentetik şirketle kayıt, dosya, arama, CSV, AI işi, doğrudan kimlik erişimi ve rol/tesis yetkisi testleri. Üyelik kaldırılınca oturum ve bekleyen iş kapsamı yeniden denetlenmeli.
3. Sorumlu/termin, kararın uygulanması, kanıtla kapanış, gerekçeli düzeltme ve kısmi miktar işlemleri. Karar verilmesi işlemin tamamlanması sayılmamalı.
4. Ayrı test/pilot ortamı, otomatik yedek, bağımsız geri yükleme, izleme ve olay müdahalesi. Şüpheli erişimde oturumu iptal etme, kapsamı korunan günlüklerle araştırma, ilgili anahtarları değiştirme ve bildirim sorumlusu belirlenmeli. Hukuki bildirim süreleri gerçek olay ve güncel yükümlülüklerle ayrıca değerlendirilir.
5. Gerçek veri öncesinde veri envanteri, sorumluluklar, hizmet/işleme şartları ve saklama süreleri netleşmeli. Gereksiz kişisel veri toplanmamalı.
6. Önce sentetik verilerle prova; sonra önerilen 1–2 şirket, şirket başına tek tesis ve 2–5 kullanıcıyla kontrollü web pilotu. Bunlar henüz bulunmuş müşteriler değildir. Önerilen süre 2–4 hafta; destek sorumlusu ve geri dönüş yolu tanımlı olmalı.
7. Başarı ölçümleri: kayıt/kapanış süresi, eksik kanıt, geciken işler, AI düzeltme ihtiyacı ve kullanıcıların işi tamamlayabilmesi. Hedefler pilot başlangıcında işletmeyle belirlenmeli.

## Mobil sıra

Önce kararlı ortak API ve güvenli web pilotu. Ardından ortak arayüzün Capacitor ile paketlenmesini değerlendirme: kamera, güvenli kimlik bilgisi saklama, bağlantı kesilmesi ve senkronizasyon, bildirimler, dosya izinleri. Android kapalı test ve iOS TestFlight öncesinde gerçek cihaz testleri ve imzalama gerekir; iOS için macOS derleme ortamı gerekir. Mağaza hesapları, gizlilik beyanları ve mağaza incelemesi ayrı işlerdir.

## Kaynaklar

- https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- https://www.postgresql.org/docs/17/ddl-rowsecurity.html
