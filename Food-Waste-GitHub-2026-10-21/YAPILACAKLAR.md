# Food & Waste — aktif yapılacaklar

Son güncelleme: 21 Ekim 2026. Kullanıcının isteğiyle kalıcı olarak kaydedildi. Zamanlanmış hatırlatıcı değildir.

## Öncelik 1: ChatGPT ajan bağlantısını uçtan uca doğrula

- [x] Özel tüneli başlat; sağlıklı ve hazır durumunu doğrula.
- [x] Doğru tünelle Food & Waste Ajanları bağlantısını oluştur.
- [x] ChatGPT araç listesinde uygulamanın beş aracını doğrula.
- [ ] Konuşmada Food & Waste Ajanları bağlantısını seç; foodwaste_health çağrısının gerçek yanıtında uygulama ve metin ajanı durumunu kontrol et.
- [ ] Aşağıdaki sentetik içeriği kullanıcıya gösterip gönderim onayını al; consent ancak açık onayla true olmalı.
  - Başlık: ChatGPT uçtan uca ajan denemesi
  - Açıklama: Sentetik test önerisi: mobil geri bildirim formunda fotoğraf ekleme düğmesinin yanına kısa kullanım açıklaması eklenmesi değerlendirilsin. Gerçek müşteri veya kişisel veri içermez.
- [ ] foodwaste_submit_feedback ile onaylanan içeriği gönder. UUID request_id ve bildirim kimliğini kaydet; tekrarda aynı request_id kullan.
- [ ] foodwaste_start_review ile iki ajan incelemesini başlat; iş kimliğini kaydet.
- [ ] foodwaste_get_feedback ile incelemenin tamamlandığını ve analiz/görev taslağını doğrula. Başarısızlığı başarı sayma.
- [ ] SaaS geri bildirim ekranında aynı kaydı doğrula. İnsan onayı olmadan görev oluşturma veya otomatik düzeltme yapma.
- [ ] Gerçek ChatGPT araç yanıtlarıyla sonucu TUNEL-DUZELTME-DURUMU.md dosyasına işle.

Mevcut engel: bu konuşmanın araç listesinde hâlâ eski Chrome bağlantısı var; yeni beş ajan aracı çağrıya açık değil. İlk adım: @ menüsünden tam adıyla Food & Waste Ajanları seçip “Bağlantı sağlık kontrolünü çalıştır” demek. Yerel SDK testi geçti; bu, ChatGPT üzerinden çağrı yerine sayılamaz.

## Sonraki bakım

- [ ] Yanlış Chrome bağlantılı eski Food & Waste kaydının kaldırılmasını kullanıcıyla kararlaştır; kendiliğinden silme.
- [ ] Oluşturulurken 7 günlük süre seçilen tünel anahtarının devamlılığını planla; anahtarı belgelere yazma.

Pilot ve üretim gereksinimleri PILOT-HAZIRLIK.md ve URUN-VE-YAYIN-ANALIZI.md dosyalarında takip edilir.
