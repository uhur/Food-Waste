# Tünel düzeltme durumu — 21 Ekim 2026

## Güncel sonuç — aşağıdaki ilk kurulum notlarından sonra

Kullanıcı anahtarını maskelenmiş yerel alana girdi. Resmî foodwaste runtime kontrolünde process_running, healthy ve ready true doğrulandı. Doğru tünelle Food & Waste Ajanları bağlantısı kuruldu: YOUR_PLUGIN_ID. ChatGPT arayüzünde foodwaste_health, foodwaste_submit_feedback, foodwaste_list_feedback, foodwaste_start_review ve foodwaste_get_feedback görüldü. Kanıt: test-results/chatgpt-agents-connected.png.

Gerçek ChatGPT sağlık çağrısı ve uçtan uca ajan denemesi henüz tamamlanmadı; bu konuşmada yeni araçlar henüz erişilebilir değil. Kalıcı takip: YAPILACAKLAR.md. Eski Chrome bağlantısı silinmedi. Aşağıdaki anahtar eksikliği ve henüz bağlanılmadığı ifadeleri önceki kurulum aşamasının tarihçesidir.

## İlk kurulum tarihçesi

Mevcut eklenti kimliği: YOUR_PLUGIN_ID. Önceki keşifte tarayıcı js/turn_ended araçlarına bağlanmıştı; Food & Waste'in beş aracı değildi. Eklenti silinmedi ve yetkileri genişletilmedi.

Kullanıcının oluşturduğu doğru tünel: YOUR_TUNNEL_ID. Platform organizasyonu mevcut kişisel organizasyon; gözlenen tabloda ChatGPT çalışma alanı ilişkisi boştu. İlişki ve ChatGPT bağlantısı çalışma istemcisi hazırlandıktan sonra ayrıca doğrulanmalı.

Resmî openai/tunnel-client sürümü v0.0.16 Windows amd64 paketi indirildi. SHA-256 özeti GitHub'ın sürüm asset digest değeriyle eşleştirildi. Paket .local/tunnel-client/bin altında; profile foodwaste, HTTP hedefi http://127.0.0.1:3102/mcp, sağlık adresi 127.0.0.1:3103. Tünel profili .local/tunnel-client/profiles/foodwaste.yaml içindedir; anahtar içermez.

`doctor --explain`: profil ve tünel yapılandırması geçti; CONTROL_PLANE_API_KEY tanımlı olmadığı için çalışma engellendi. Bir API anahtarı oluşturulmadı veya okunmadı. OpenAI Platform güvenli anahtar seçme aracı kimlik doğrulaması kabul edildiğini bildirdi; ancak tekrarında araç kullanılamaz hâle geldi. Bu nedenle gizli anahtar tarayıcıdan otomatik alınmadı.

TUNELI-BAGLA.cmd kullanıcıya yerel, maskelenmiş anahtar alanı açar. Anahtar sohbet, komut argümanı veya düz metin dosyasına yazılmaz. Kullanıcı ayrı kutuyu işaretlerse Windows DPAPI ile şifrelenmiş kopyası yalnızca .local altında saklanır. Varsayılan saklama kapalıdır. Script anahtarı alt sürecin ortamına aktarır, doctor denetiminden sonra resmî yönetilen runtime connect/status akışını kullanır. Anahtar olmadan bu çalışma akışı henüz uçtan uca test edilmedi.

Eksik kullanıcı adımı: resmî Platform ekranından uygun organizasyonda Tunnels Read + Use yetkili çalışma anahtarını kendi oluşturup yerel güvenli alana girmek. Anahtar sohbetle paylaşılmamalı. Ardından runtime ready, çalışma alanı bağı, mevcut eklentinin desteklenen bağlantı güncelleme yolu ve gerçek foodwaste_health çağrısı doğrulanmalı. Sonraki erişim değişiklikleri gerekli kullanıcı onayıyla yapılmalı; eski bağlantı çalışıyor diye hazır sayılmamalı.
