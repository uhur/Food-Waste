# Geri bildirim ve ajan modülü — çalışan yerel sürüm

21 Ekim 2026. Önizleme: http://127.0.0.1:3100/#feedback

## Çalışan akış

Kullanıcı hata, öneri veya kullanım sorusunu; ekran, başlık ve açıklamayla kaydeder. Gönderim için içerik onayı gerekir. Form yalnızca seçilen alanları gönderir; ekran görüntüsü, belgeler, gezinme veya form alanlarının otomatik toplanması yoktur. Bildirim kaydetmek model çalıştırmaz.

“Ajanlarla incele” eylemi, mevcut yerel Qwen3 8B modelini iki farklı görevle sırayla çağırır. İlk çağrı konu/öncelik önerisi, özet ve açıklama sorusu üretir. İkinci çağrı ilk çıktıyı ve bildirimi kullanarak görev başlığı, işlem önerisi ve doğrulama adımı üretir. Koordinasyon kod tarafından yürütülür; üçüncü adım JSON alanlarını ve izin verilen değerleri doğrulayan kural kontrolüdür, üçüncü bir AI modeli değildir.

Adımlar ve sonuçlar PostgreSQL'de saklanır. Kullanıcı onayı olmadan takip görevi açılmaz. Aynı onayın yeniden gönderimi mevcut görevi döndürür. Açık görevi olan bildirimde yeni analiz/görev engellenir. Tamamlama açıklaması kaydedilir; görev tamamlamak bildirimi otomatik çözmez. Bildirim durumu gerekçeyle ayrıca değiştirilebilir; geçmiş saklanır.

Yeni tablolar: app_feedback, app_feedback_jobs, app_feedback_tasks. Mevcut kayıt/belge/AI tabloları korunmuştur. JSON geliştirme deposunda da yeni alanlar tutulur; bu üretim depolama seçeneği değildir.

## Kullanım

1. Sol menü veya footer üzerinden “Geri bildirim ve ajanlar” ekranını açın.
2. Sentetik bir sorun/öneri yazıp içerik onayıyla kaydedin.
3. “Ajanlarla incele” ile iki aşamayı başlatın. Ollama ve metin modeli hazır olmalı. Mevcut fotoğraf/kayıt incelemesiyle ortak tek işlem sınırı kullanılır.
4. Soruyu ve öneriyi değerlendirin. Uygun bulursanız “Taslağı onayla, görev oluştur” eylemini kullanın.
5. Gerçekleştirilen işi ve doğrulamasını görev sonucuna yazın. Bildirim durumunu ayrıca değerlendirin.

## Doğrulama

- 18 birim testi geçti. Yeni kapsam: onaysız veri gönderimini reddetme, izinli alanlar, iki model adımının onaysız görev yazmaması, yinelenen onayın tek görev oluşturması, bozuk çıktıda hata/kilit temizliği, kapalı bildirimde görev engeli ve gerekçeli durum değişimi.
- Tarayıcıdan sentetik bildirim kaydedildi; gerçek Qwen modeli iki aşamayı tamamladı. Taslak onayı, görev kaydı, tamamlama açıklaması ve durumun otomatik çözülmemesi doğrulandı.
- Uygulama yeniden başlatıldı; bildirim, ajan sonucu ve görev korundu. Ana önizleme 3100 üzerinde çalışıyor.
- verify-feedback.mjs API kontrollerini ve ilgili satırların PostgreSQL'deki varlığını doğruladı.
- verify-restore.mjs artık altı tabloyu karşılaştırıyor. Yedek geçici veritabanına geri yüklendi; bütün satırlar eşleşti. Bu, dosya deposunun bağımsız sunucuda kurtarılması testi değildir.
- Masaüstü ve 390 px iframe görünümü görsel olarak kontrol edildi; fiziksel telefon testi değildir. Ekran görüntüleri test-results altında.

## Açık sınırlar

Bu modül SaaS içindedir. Başka uygulamaya gömülebilen dağıtılabilir SDK veya tarayıcı eklentisi henüz yoktur. API uçları dahili yerel demo içindir; şirket yetkileri olmadan dışa açılmamalıdır.

Kullanıcı/şirket/tesis üyeliği ve yetki denetimi henüz uygulanmadı. Onay veren “Yerel demo kullanıcısı” olarak kaydedilir; gerçek kimlik kanıtı veya değiştirilemez denetim günlüğü değildir. Gerçek müşteri verisi kullanılmamalı.

Ajanlar yalnızca yazılan geri bildirimi işler. Kaynak kodu incelemez, belge içeriğini okumaz, başka uygulamayı kullanmaz veya hatayı kendiliğinden düzeltmez. Aynı hazır model iki ayrı uzman rolünde kullanılır; bağımsız eğitilmiş modeller veya serbest çok ajanlı bir sistem kurulmuş değildir. Model çıktısının alan doğrulaması önerinin doğruluğunu kanıtlamaz.

İş adımları kalıcıdır ancak worker aynı Node sürecindedir; dayanıklı kuyruk, otomatik devam ve dağıtık kilit yoktur. Yarım işler yeniden başlatmada başarısız işaretlenir, kullanıcı tekrar deneyebilir. Model için süre/çıktı sınırı var; şirket başına bütçe/kota yoktur.

Görev sorumlusu, termin, bildirimler, taslak düzenleme ve dış uygulama bağlantıları sonraki kapsamdır. Güvenli şirket/kullanıcı temeli PILOT-HAZIRLIK.md planında önceliğini korur.
