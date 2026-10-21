# SaaS başlangıç kararı

Tarih: 21 Ekim 2026

## Eldeki gerçek durum

Paylaşılan konuşma incelendi. Çalışma klasöründe uygulama kaynakları yok; yalnızca .git klasörü var. Önceki konuşmada hazır olduğu söylenen ZIP bu incelemede mevcut değil. Müşteri görüşmesi, ödeme, pilot veya ölçülmüş problem verisi bulunmuyor.

5.000 TL / ilk 30 gün bütçesi önceki konuşmadan devralınan planlama tavanıdır; harcama yetkisi veya yapılmış harcama değildir. Geliştirme emeği bu tutara dahil değildir.

## Doğru yaklaşımlar

- Şirket, tesis, üyelik, yetki, kayıt geçmişi ve kanıt belgeleri ortak altyapı kullanabilir.
- Resmî sistemlerin yerine geçme iddiası yerine kayıt ve hazırlık iş akışlarına odaklanmak uygundur.
- Sentetik verili çalışan örnek, görüşmelere başlamadan da hazırlanabilir.
- Food & Waste içinde uygunsuz parti ile atık teslimini ilişkilendiren akış, test edilebilir bir ürün hipotezidir.

## Düzeltilmesi gerekenler

- Mevzuat yükümlülüğü, yazılım satın alma talebini kanıtlamaz. Rakip bulunması da ürünümüz için ödeme isteğini kanıtlamaz.
- Ortak müşteri, ortak bütçe veya satın alma sorumlusu anlamına gelmez. KVKK ve İSG paketinin birlikte satılacağı henüz bilinmiyor.
- Fire, uygunsuz ürün ve hukuken atık sayılan malzeme aynı şey değildir. Atık sınıflandırması otomatik kabul edilmeyecek.
- Bakanlığın İBYS açıklaması, OSGB hizmeti alan işverenin ikinci İBYS yazılımına ihtiyacı olmadığı bağlamındadır; işverenin başka operasyon yazılımı satın alamayacağı anlamına gelmez.
- VERBİS istisnası ile bütün KVKK yükümlülüklerinden muafiyet aynı şey değildir.
- Yedi günlük VERBİS değişiklik bildirimi sicildeki bilgiler içindir; her iç kayıt değişikliği için genel süre olarak uygulanamaz.
- Açık kaynak, şirket içi kurulum ve AI ajanları başlangıç şartı değildir. Bakım, destek, lisans ve dağıtım maliyetleri vardır. Lisans seçilmeden proje açık kaynak olarak tanıtılmayacak.
- Next.js, FastAPI, Docling ve Ollama'nın hepsini ilk sürüme eklemek gereksiz işletim yükü yaratır. Teknoloji uygulama ihtiyacına göre seçilecek.
- Tarayıcıda kayıt tutan HTML örneği, çok kullanıcılı SaaS değildir. Giriş ekranı da tek başına güvenlik kanıtı değildir.
- Önceki TL maliyet aralıkları teklif veya doğrulanmış toplam maliyet değildir. Güncel sağlayıcı fiyatları satın alma öncesi kontrol edilecek.
- Resmî sistem arızası, dışarıdan geliştirdiğimiz yazılımın çözebileceği problem olduğunu göstermez.

## Başlangıç önerisi

İki ürün vizyonu korunur: Food & Waste ve KVKK–İSG. İlk geliştirme Food & Waste için dar bir örnek akış olur. İkinci ürün ilk sürümle eşzamanlı geliştirilmez. Bu tercih pazar üstünlüğü bulgusu değil, kapsamı ve maliyeti sınırlama kararıdır.

İlk hedef kullanıcı hipotezi: tek tesisli küçük veya orta ölçekli gıda üreticisinde kalite sorumlusu. Restoran, otel, fabrika ve çevre danışmanını aynı anda hedeflemiyoruz.

İlk değer önerisi: Bir uygunsuz partinin kararını, miktarını ve varsa atık teslim kanıtını aynı dosyada takip etmek.

## İlk çalışan sürüm

1. Sentetik şirket ve tesis ile örnek parti listesi.
2. Parti kodu, ürün, miktar, birim, tarih ve sorumlu içeren uygunsuzluk kaydı.
3. Taslak → incelemede → karar verildi → kapandı durumları.
4. Karar türleri: yeniden işleme, iade, atığa ayırma veya diğer. Karar gerekçesi zorunlu.
5. Yalnızca atığa ayırma kararında bağlı atık kaydı; atık kodu uzman onayına kadar belirsiz kalabilir.
6. Atık miktarı, teslim tarihi, alıcı ve belge referansı; miktar ve birim tutarlılığı kontrolü.
7. İşlem geçmişi ve CSV dışa aktarımı.

İlk örnek; yasal uygunluk puanı, otomatik atık kodu, resmî beyan, AI hukuki karar, tam HACCP, ERP, sensör veya sağlık verisi içermez. Örnek uygulamadaki belge referansı gerçek dosya depolaması diye sunulmaz.

## Gerçek SaaS aşamasının kabul koşulları

- Sunucuda kalıcı veri; şirket ve tesis ilişkilerinin açık veri modeli.
- Kimlik doğrulama ve sunucuda rol denetimi.
- İki farklı şirketle veri yalıtımının negatif testleri.
- Karar veren, tarih, gerekçe ve değişiklik geçmişinin tutulması; geçmiş kayıtların sıradan kullanıcı tarafından değiştirilememesi.
- Onaylanmış kararların sessizce üzerine yazılmaması; düzeltmenin yeni işlem olarak kaydı.
- Dosya yüklemede boyut, tür, erişim ve indirme yetkisi denetimleri.
- Yedek alma ve geri yükleme denemesi.
- Kullanıcıya veri silme/saklama ve hizmet kapsamının açıklanması.

Bu koşullar tamamlanmadan yerel örnek üretime hazır SaaS olarak adlandırılmayacak.

## Geliştirme sırası

1. Dar iş akışını sentetik verilerle çalıştır ve kullanım hatalarını düzelt.
2. Aynı akışı veritabanı, giriş ve şirket yalıtımıyla kalıcı hale getir.
3. Belgeler, onay ve işlem geçmişini tamamla; temel güvenlik ve geri yükleme kontrollerini çalıştır.
4. Gösterilebilir demo yayınını hazırla. Gerçek kullanıcı değerlendirmesi mümkün olduğunda görev tamamlama, eksik adım ve ödeme isteği ölç.

Görüşme yapamamak geliştirmeyi durdurmaz; ticari doğrulamanın eksik kaldığı açıkça kaydedilir. İkinci ürüne geçiş yalnızca ilk örneğin görünüşüne göre kararlaştırılmaz.

## Kontrol edilen resmî kaynaklar

- ÇSGB İSG SSS, özellikle sorular 78–86: https://www.csgb.gov.tr/sikca-sorulan-sorular/is-sagligi-ve-guvenligi-genel-mudurlugu/
- Veri Sorumluları Sicili Hakkında Yönetmelik, özellikle madde 13: https://www.kvkk.gov.tr/Icerik/5442/VERI-SORUMLULARI-SICILI-HAKKINDA-YONETMELIK
- KVKK sicil kayıt istisnaları: https://www.kvkk.gov.tr/Icerik/2044/Veri-Sorumlulugu-Siciline-Kayit-Istisnalari
- KVKK veri güvenliği yükümlülükleri: https://www.kvkk.gov.tr/Icerik/2040/Veri-Guvenligine-Iliskin-Yukumlulukler
- Tarım ve Orman Bakanlığı işletmeci kılavuzları: https://www.tarimorman.gov.tr/GKGM/Menu/132/Gida-Isletmecisi
- 2025 atık beyanı için 2026 duyurusu; geçmiş döneme aittir, gelecek dönem takvimi olarak kullanılamaz: https://gaziantep.csb.gov.tr/2025-yili-tehlikeli-tehlikesiz-ve-tibbi-atik-beyan-sistemi-acilmistir-duyuru-469466

Önceki rakip özellikleri, rakip fiyatları ve altyapı fiyatları bu dosyada yeniden doğrulanmış kabul edilmez. Bu inceleme eksiksiz pazar araştırması veya işletmeye özgü mevzuat görüşü değildir.
