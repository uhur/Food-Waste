# Ürün tasarımı ve yatırımcı demosu

21 Ekim 2026

## Tasarım kararı

Food & Waste adı ve mevcut yeşil palet korundu. Ürün tanımı: **Kalite ve Atık Yönetimi**. Ana anlatı: gıda üretimindeki uygunsuzluğu, incelemeyi, yetkili kararını ve atık teslim belgesini aynı parti dosyasına bağlamak.

İlk tasarımda üst şerit sayfa adını tekrarlıyor, alt alan yalnızca ürün ve teknik depo bilgisini gösteriyordu. Ürün amacı, hedef kullanıcı, güven yaklaşımı ve çalışan kapsam yeterince görünür değildi. Yeni düzen bu bilgileri uygulamanın navigasyonuna ve tanıtımına yerleştirir.

## Yeni bilgi mimarisi

| Alan | İşlev |
|---|---|
| Üst şerit | Aktif tesis, parti/ürün/belge araması, canlı AI bağlantı bilgisi, demo çalışma alanı bilgisi |
| Operasyon özeti | Ürün amacı, örnek iş akışı, gerçek kayıt sayıları, hızlı işlemler ve son partiler |
| Parti kayıtları | Filtreleme, karar, teslim ve dosya geçmişi |
| Belge arşivi | Kayda bağlı fotoğraf ve PDF'ler |
| Akıllı inceleme | Parti seçimi, inceleme başlatma ve sonuç geçmişi |
| Ürünü tanıyın | Çözülen problem, hedef ekipler, dört adımlı akış ve mevcut kapsam |
| Güven ve veri | İnsan onayı, dosya kontrolleri, veri akışı, kullanım ilkeleri ve yayın hazırlığı |
| Footer | Kısa ürün anlatısı, platform bağlantıları, veri ve AI ilkeleri, gerçek bağlantı kontrolü |

Üst arama yalnızca görünüm değildir: mevcut kayıt ve belge verilerinde arar, sonucu ilgili dosyada açar. Ctrl/Cmd+K kısayolu, Enter ve ok tuşları desteklenir. Arama bu geliştirme sürümünde yüklenmiş veri üzerinde çalışır; üretim için sunucuda sayfalama ve yetkili arama gerekir.

Ürün sayfası: `http://127.0.0.1:3100/#product`

Güven sayfası: `http://127.0.0.1:3100/#trust`

## Görsel düzen

- İşlevsiz breadcrumb yerine tesis ve global arama alanı.
- Operasyon ve ürün/güven navigasyonu için iki grup.
- Tutarlı çizgi SVG ikonları; başlık, açıklama ve eylemlerde ortak hiyerarşi.
- Markayı, ürün anlatısını ve bağlantıları taşıyan üç sütunlu footer.
- Mobilde sade üst arama, açılır yan menü ve dört temel eylemli alt menü.
- Ürün anlatısında daha büyük metin, belirgin başlıklar ve güçlendirilmiş açıklama kontrastı.

Örnek parti illüstrasyonu açıkça iş akışı gösterimi olarak etiketlidir. Operasyon sayaçları veritabanından gelir; müşteri sayısı, tasarruf oranı, sertifika veya pazar verisi olarak sunulmaz.

## Güven açıklamalarının sınırı

Güven sayfasındaki mevcut kontroller ile yayın öncesi işler ayrı gösterilir. Bu içerik ISO/SOC 2 sertifikası, KVKK uygunluk belgesi, güvenlik denetimi veya nihai gizlilik politikası yerine geçmez. İletişim adresi, şirket geçmişi, müşteri referansı ve tamamlanmamış güvenlik özellikleri uydurulmadı.

Kullanıcı girişi, şirket yetkilendirmesi, özel bulut deposu ve üretim güvenliği henüz tamamlanmış değildir. Tasarımın iyileşmesi bunları tamamlamaz. Mevcut uygulama yerel ürün demosudur.

## Önerilen demo akışı

1. **Ürün anlatısı:** Ürünü tanıyın sayfasından hedef kullanıcıyı ve bağlı kayıt fikrini anlatın.
2. **Somut dosya:** Operasyon özetine geçip DEMO-2026-041 partisini aramayla açın.
3. **Saha girişi:** Fotoğraf formunda sentetik etiketle taslak çıkarımını gösterin; kullanıcı kontrolü olmadan kaydedilmediğini açıklayın.
4. **AI'nın rolü:** Akıllı incelemede parti seçip eksik bilgi ve kontrol önerilerini gösterin. Model doğruluğunun uzman değerlendirmesi gerektirdiğini belirtin.
5. **İzlenebilirlik:** Kapanmış sentetik test kaydında karar, teslim ve belge geçmişine geri dönün.
6. **Güven ve gelişim:** Mevcut kontrolleri, kullanıcı/şirket yetkilerinin ve üretim ortamının bir sonraki geliştirme aşaması olduğunu gösterin.

Bu akış ürünün çalışmasını gösterir. Yatırım görüşmesi için ayrıca gerçek müşteri problemi, pilot sonucu, fiyatlandırma, dağıtım kanalı ve maliyet varsayımları kanıtlarla hazırlanmalıdır. Bunlar arayüzdeki gösterim verilerinden çıkarılamaz.

## Kontroller

- Gerçek kayıtla üst arama ve sonuçtan parti dosyasına geçiş kontrol edildi.
- Footer'dan veri kullanımı bölümüne geçiş ve canlı durum penceresi kontrol edildi.
- Ürün ve güven sayfaları ayrı adreslerden açılabilir; tarayıcı başlığı ve aktif menü değişir.
- Masaüstü ve 390 px mobil tarayıcı görünümü incelendi. Fiziksel cihaz testi ve kapsamlı erişilebilirlik denetimi bu tasarım kontrolünün kapsamını aşar.
- Yeni JavaScript ve sunucu dosyalarının sözdizimi kontrol edildi. Kayıt/veritabanı iş kuralları bu turda değiştirilmedi.

İçerik mimarisi için [Sweep](https://www.sweep.net/) üzerindeki ürün, AI ve güven alanlarının nasıl ayrıldığı incelendi. Tasarımdaki ekranlar ve metinler Food & Waste'in mevcut iş akışına göre hazırlandı.
