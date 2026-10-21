# Food & Waste — ChatGPT'ye elle ekleme

Güncel durum: Food & Waste Ajanları oluşturuldu ve beş araç ChatGPT arayüzünde doğrulandı. Aşağıdaki metin ilk kurulum rehberidir. Güncel durum TUNEL-DUZELTME-DURUMU.md, kalan kabul denemeleri YAPILACAKLAR.md dosyasındadır.

21 Ekim 2026. Hazırlanan bağlantı özel yerel demo içindir. ChatGPT hesabında oluşturma ve etkinleştirme kullanıcıya bırakıldı; bu dosya kurulumun tamamlandığı anlamına gelmez.

## Formda kullanılacak bilgiler

| Alan | Değer |
|---|---|
| Ad | Food & Waste Demo |
| Açıklama | ChatGPT üzerinden demo geri bildirimlerini kaydetme ve iki yerel ajanla inceleme. Yalnızca bu bağlantıda oluşturulan bildirimlerle çalışır. |
| Tercih edilen bağlantı | Tünel — OpenAI Secure MCP Tunnel |
| Tünelin yerelde bağlanacağı MCP adresi | http://127.0.0.1:3102/mcp |
| Uygulama paneli | http://127.0.0.1:3100/#feedback |

**127.0.0.1 adresini ChatGPT web formundaki genel sunucu URL'si alanına yazmak bağlantıyı tamamlamaz.** Bu adres yalnızca bu bilgisayarı ifade eder. ChatGPT'ye geçerli ve çalışan tünelin kimliği verilir; alternatif genel HTTPS sunucusu henüz hazırlanmadı. Ana SaaS'ın 3100 portunu internete açmayın.

## 1. Yerel hizmetleri açın

Eklenti simgesi için `chatgpt/assets/food-waste-logo-256.png` dosyasını yükleyin: 256 × 256 px, 4.515 bayt; formdaki 10 KB sınırının altındadır. Daha büyük PNG ve ölçeklenebilir SVG aynı klasördedir.

Ana uygulama için BASLAT.cmd; ayrı MCP köprüsü için BASLAT-CHATGPT.cmd. Ana uygulama, PostgreSQL ve Ollama çalışmalı. MCP sunucusunun varsayılan portu 3102'dir. Zaten açıksa ikinci kez başlatmayın; port kullanım hatası alırsınız.

Komut satırı karşılığı, proje dizininde: `node chatgpt/server.mjs`. Stdio kullanan yerel MCP istemcileri için `node chatgpt/server.mjs --stdio` da desteklenir. Stdio, ChatGPT web formunda URL yerine yazılacak bir komut değildir.

## 2. Özel tüneli hazırlayın

1. https://platform.openai.com/settings/organization/tunnels adresini açın. Doğru Platform organizasyonunu ve hedef ChatGPT hesabı/çalışma alanını seçin. Erişim yoksa ilgili yönetici izin vermelidir; hesabınızda kullanılabildiği varsayılmaz.
2. Var olan uygun tüneli kullanın veya yeni tünel oluşturun. Tüneli doğru ChatGPT çalışma alanıyla ilişkilendirin. Oluşan `tunnel_id` değerini not edin. Bu projede henüz bir tünel oluşturulmadı.
3. Platform'un indirme bağlantısından resmî `tunnel-client` istemcisini edinin. CLI sürümüne göre `tunnel-client help quickstart` çıktısını esas alın.
4. Çalışma anahtarını güvenli yerel yöntemle sağlayın. Anahtarı sohbet, ekran görüntüsü veya komut satırı argümanlarına yazmayın. Bu MCP sunucusunun kendisi OpenAI API anahtarı kullanmaz; özel tünel istemcisi ayrı kimlik doğrulaması gerektirir.
5. Resmî belgedeki HTTP profilini kullanarak istemciyi `http://127.0.0.1:3102/mcp` adresine yönlendirin. Örnek, gerçek kimliği kendi bilgisayarınızda değiştirin:

```text
tunnel-client init --sample sample_mcp_stdio_local --profile foodwaste --tunnel-id YOUR_TUNNEL_ID --mcp-server-url http://127.0.0.1:3102/mcp
tunnel-client doctor --profile foodwaste --explain
tunnel-client run --profile foodwaste
```

Örnek profil adı resmî belgeden gelir; kurduğunuz sürüm HTTP profili için farklı seçenek istiyorsa CLI yardımını izleyin. `doctor` başarılı ve istemci etkin polling durumunda olmadan ChatGPT keşfi çalışmaz. API anahtarı veya tünel izinleri bu kod deposunda oluşturulmadı.

## 3. ChatGPT'de oluşturun

1. https://chatgpt.com/plugins → Ekle → Özel MCP sunucusu ekle.
2. Yukarıdaki ad ve açıklamayı girin. Bağlantı olarak Tünel'i seçin; hazırladığınız tünel kimliğini girin.
3. Mevcut demo MCP sunucusu OAuth sunmaz. Yalnızca kendi özel çalışma alanınızla ilişkili, çalışır durumdaki demo tünelinde uygulama kimlik doğrulaması “yok” seçeneğiyle denenebilir. Tünel erişimi uygulama kullanıcı/şirket yetkilendirmesi değildir. Üretimde OAuth, şirket kapsamı ve kullanıcı denetimi tamamlanmalıdır.
4. Araçları ve aşağıdaki erişim sınırlarını inceleyin. Risk onayını ve “Eklenti olarak oluştur” işlemini siz tamamlayın. Genel yayımlama gerekli değildir.
5. Oluşan eklentiyi kurun; yeni sohbette `@` ile Food & Waste Demo'yu seçin. Hesap/çalışma alanı politikası izin vermiyorsa bu aşama tamamlanamaz.

## Araçlar ve izin sınırı

| Araç | İşlev |
|---|---|
| foodwaste_health | Uygulama ve metin ajanı hazır mı? |
| foodwaste_submit_feedback | Açık içerik onayıyla başlık/açıklama/tür/ekran bilgisini SaaS'a kaydeder. |
| foodwaste_list_feedback | Bu bağlantıdan oluşturulan son 20 bildirimi getirir. |
| foodwaste_start_review | Kapsamdaki bir bildirimi iki yerel ajana gönderir; hızlıca iş kimliği döner. |
| foodwaste_get_feedback | Bildirimi ve inceleme/taslak sonucunu getirir. |

Görev onayı, görevi tamamlama, belge indirme, parti kayıtlarını listeleme, serbest SQL, dosya sistemi, shell veya genel ağ erişimi araçları yoktur. ChatGPT'nin yazdığı bildirimler ve ajan çıktıları OpenAI sohbetine döner; bu, içeriklerin artık yalnızca bilgisayarda kaldığı anlamına gelmez. Gerçek müşteri veya kişisel veriyle test etmeyin.

MCP köprüsü mevcut SaaS API'sinden içerik okur; yalnızca kendi oluşturduğu kimlikleri modele döndürür. `data/chatgpt-scope.json` yerel kapsam indeksidir. Bu, gerçek kullanıcı/şirket yetki sistemi değildir. Dosya bozulursa işlem hata verir; tüm kayıtları açmaz. Her kurulum aynı yerel kapsamı paylaşır; çok kullanıcıya dağıtım uygun değildir. Kapsamı korumak için aynı veri dizininde tek MCP süreci çalıştırın.

## 4. Etkinliği gerçek çağrıyla doğrulayın

Önce: “Food & Waste bağlantısını kontrol et.”

Sonra: “Food & Waste'e şu sentetik öneriyi gönder: Belge arşivindeki arama açıklaması daha anlaşılır olsun. Bu metnin kaydedilmesini onaylıyorum.”

Ardından: “Bu bildirimi ajanlarla incele.” İnceleme çalışırken sonucu daha sonra sorgulayın. “Bildirimin sonucunu göster” ile taslağı görün. Onayla görev oluşturma işlemi yerel SaaS panelindedir.

Hesabınızda `foodwaste_health` ve örnek bildirim çağrısı başarılı olmadan eklenti etkinliği doğrulanmış sayılmaz. Yerel SDK testi, ChatGPT hesabının eklentiyi gerçekten kullandığını kanıtlamaz.

## Sorun giderme

- Bağlantı bulunamıyor: ana uygulama/MCP süreci açık mı, tünel doğru çalışma alanına bağlı mı, tünel istemcisi polling yapıyor mu?
- Kimlik doğrulama başarısız: demo sunucusu OAuth sunmaz; yanlışlıkla OAuth seçilmiş olabilir. Genel HTTPS'e kimlik doğrulamasız yayın yapmak çözüm değildir.
- AI meşgul: aynı GPU'da tek işlem çalışır. Diğer fotoğraf/kayıt incelemesini bekleyin.
- Kapsam dışı bildirim: SaaS'ta daha önce açılmış bir bildirime bu bağlantı erişemez; ChatGPT'den yeni sentetik bildirim oluşturun.
- Araçlar güncel değil: sunucuyu yeniden başlatıp ChatGPT eklenti bağlantısında Refresh/Yenile kullanın.

## Yerelde doğrulanan durum

22 birim testi geçti. Resmî MCP SDK istemcisi beş aracı keşfetti; sentetik bildirim SaaS'a kaydedildi; yinelenen aynı istek yeni bildirim oluşturmadı. İki gerçek Qwen3 8B model çağrısı tamamlandı ve sonuç “Onay bekliyor” oldu. Kullanıcı onayı olmadan görev açılmadı. Kapsam dışı bildirim kimliği ve tarayıcı Origin başlıklı istek reddedildi. Bu doğrulama `node chatgpt/verify.mjs` ile yapıldı; gerçek ChatGPT hesabından araç çağrısı henüz yapılmadı.

Eklenti ekleme formu ad/açıklama ve Tünel seçimiyle hazır bırakıldı. Tünel kimliği boş; kimlik doğrulama formda varsayılan OAuth olarak duruyor. Risk onayı işaretlenmedi ve eklenti oluşturulmadı. HTTP MCP sunucusu yerelde çalışıyor; özel tünel istemcisi kurulup bağlanmadı.

## Resmî kaynaklar

- https://developers.openai.com/plugins/deploy/connect-chatgpt
- https://developers.openai.com/api/docs/guides/secure-mcp-tunnels
- https://developers.openai.com/plugins/build/plugins
