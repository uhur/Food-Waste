# Eklenti, geri bildirim ve ajan mimarisi

21 Ekim 2026. Hedef mimari. Kullanıcı ilk yüzey olarak SaaS içi paneli seçti; geri bildirim kaydı, iki aşamalı ajan incelemesi ve onaylı görev takibinin ilk yerel sürümü kuruldu. Çalışan kapsam ve testler GERI-BILDIRIM-DURUMU.md içinde; bu belgedeki diğer roller ve harici eklenti yüzeyleri gelecek tasarımıdır. Şirket ve kullanıcı güvenliği PILOT-HAZIRLIK.md içindeki önceliğini korur.

## Ortak çekirdek

Web/mobil istemci veya eklenti → kimliği doğrulanmış API → şirket ve tesis yetki denetimi → kayıt/geri bildirim/kanıt → kalıcı iş kuyruğu → yetkisi sınırlandırılmış ajan → kaynaklı taslak → insan onayı → uygulama işlemi → denetim olayı.

Eklentiler veritabanına doğrudan bağlanmaz. Model parolası, servis anahtarı veya veritabanı bağlantısı istemciye konmaz. Şirket bağlamı doğrulanmış üyelikten gelir; bir istek alanından ya da model yanıtından türetilmez. Tarayıcı eklentisi seçilirse varsayılan tüm siteleri okuma, arka planda gezinme kaydı ve sayfaların otomatik aktarımı yok; kullanıcı eylemiyle izin verilen içerik seçilir. Android/iOS desteği masaüstü tarayıcı eklentisiyle kendiliğinden sağlanmaz.

## Üç veri akışını ayır

1. Operasyon verisi: parti, uygunsuzluk, belge, karar ve teslim. Müşterinin kendi operasyonuna aittir.
2. Kullanıcı geri bildirimi: sorun/öneri/kullanım sorusu, açıklama, kullanıcının seçtiği ilgili ekran ve isteğe bağlı kanıt. Gönderilecek içerik önceden gösterilir; iletişim bilgisi isteğe bağlıdır. Durumlar: alındı, inceleniyor, planlandı, çözüldü, kapandı. Çözüm ve kapanış gerekçesi ayrıca tutulur.
3. Tanılama: izin verilen olay adı, sürüm, zaman, işlem kimliği ve temizlenmiş hata kodu. Parti içeriği, belgeler, form metni, oturum belirteçleri, parola ve tam URL sorguları otomatik toplanmaz. Ekran kaydı veya tuş takibi varsayılan bir özellik değildir.

Müşteri içeriği otomatik eğitim verisi sayılmaz. Model geliştirmesi için kullanım amacı, erişim ve saklama ayrıca belirlenir. Şirketler arası toplu ürün ölçümlerine ham müşteri metni taşınmaz; ayrı izin ve yeniden tanınma riskinin değerlendirilmesi gerekir.

## Ajan rolleri ve sınırları

| Rol | İzinli girdi | Çıktı / sınır |
|---|---|---|
| Koordinatör | Doğrulanmış iş amacı ve kapsamı | Önceden tanımlı uzman adımlarını seçer; yeni yetki veremez |
| Belge çıkarma | İşe eklenmiş izinli belge | Alanlar ve sayfa/konum kanıtı; bilinmeyeni boş bırakır |
| Operasyon inceleme | Kapsamdaki kayıt ve kurallar | Eksik/tutarsızlık bulguları; güvenlik veya hukuki hüküm vermez |
| Geri bildirim değerlendirme | Aynı şirket kapsamında geri bildirim | Kategori, benzer kayıt önerisi, açıklama sorusu; kendiliğinden kapatmaz |
| Görev hazırlama | Onaylanmış bulgular | Sorumlu/termin/aksiyon taslağı; yazma işlemi insan onayından sonra |
| Sonuç kontrolü | Ajan çıktısı ve kaynaklar | Şema, kaynak ve tutarlılık kontrolü; başka modelin onayı doğruluk garantisi değildir |

Başlangıçta belirsiz sayıda serbestçe konuşan ajan yerine sınırlı bir iş akışı kullanılacak. Kritik miktar, durum geçişi, yetki ve tarih kuralları deterministik uygulama kodunda kalacak. Bir belge içindeki talimat, ajana yeni araç veya yetki kazandıramaz. Üründeki çalışma zamanı ajanları ile geliştirme sırasında kullanılan kodlama ajanları farklı yapılardır.

## İş sözleşmesi

Her iş için job_id, company_id, facility_scope, requested_by, amaç, izinli kayıt/belge kimlikleri, görev türü, veri sürümü, bütçe/süre/adım sınırları ve idempotency anahtarı tutulmalı. Kimlik alanlarını sunucu oluşturmalı; işlem anında üyelik ve kaynak erişimi yeniden denetlenmeli.

Çıktı: durum, yapılandırılmış bulgular, kaynak kimlikleri/sürümleri, belirsizlikler, önerilen işlemler, model/prompt sürümü ve review_required. Modelin ürettiği şirket/kullanıcı/araç adları güvenilir kabul edilmez. Kaynak erişimi iptal edilmişse çıktı gösterimi de engellenir.

Kalıcı kuyruk, kontrollü tekrar, hata/iptal durumu ve maliyet sınırı gerekir. Araçlar izin listelidir; serbest SQL, shell, sınırsız ağ erişimi ve keyfi kod yürütme yok. Yazma onayı belirli kaynak sürümüne ve belirli işleme bağlanır; değişen veri tekrar incelemeye gider. Ajanların birbirine devri kimlik ve izin kapsamını genişletemez.

## Geri bildirim veri modeli

feedback_items: şirket, tesis kapsamı, gönderen, tür, açıklama, ekran için izinli tanımlayıcı, sürüm, durum, zaman ve isteğe bağlı operasyon kaydı bağlantısı.

feedback_attachments: şirket/kayıt bağı, özel depo anahtarı, tür, boyut, dosya özeti ve tarama durumu.

feedback_events: aktör, eski/yeni durum, gerekçe ve zaman. ai_jobs ile ilişki kurulabilir. Gönderenin kendi bildirimini izlemesi, şirketin kendi bildirimleri ve platform ürün ekibinin erişimi ayrı politikalarla tanımlanmalı. Platforma gönderilecek tanılama ayrı gösterilmeli; geniş müşteri kaydı erişimi verilmemeli.

## Uygulama sırası ve kabul

1. Şirket/üyelik/oturum ve kayıt–belge–AI yetkilendirmesi. İki şirketle erişim reddi testleri geçmeden gerçek veri yok.
2. Onaylı veri gönderimi olan geri bildirim bileşeni, kalıcı saklama ve durum takibi. Gizli otomatik telemetri yok.
3. Geri bildirim sınıflandıran ve operasyon bulgusundan görev taslağı çıkaran dar ajanlar. Hatalı sonuç düzeltilebilmeli; gerçek kullanıcı örnekleriyle ölçülmeli.
4. Kullanıcının seçtiği eklenti yüzeyi. Tarayıcı ise dar izinli paket ve hedef tarayıcı testleri; SaaS içi ise mevcut görsel sistemle panel; üçüncü taraf entegrasyon ise sürümlü API ve iptal edilebilir kapsamlı yetki.
5. Kalıcı koordinatör/kuyruk ve bağımsız çalışanlar; şirket kapsamı, iptal, yinelenen istek, prompt injection, maliyet sınırı ve insan onayı testleri.

Hiçbir aşama modelin kendi kendine üretim kodu yayımlamasına, kullanıcı verisini silmesine veya başka şirkete iletmesine izin vermez. Böyle araçlar ayrıca tasarlanıp yetkilendirilmeden mevcut değildir.
