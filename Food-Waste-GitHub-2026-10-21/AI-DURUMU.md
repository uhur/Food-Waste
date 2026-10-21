# Yerel AI bağlantı doğrulaması

21 Ekim 2026, Europe/Istanbul.

- Ollama 0.40.6 kuruldu. Resmî GitHub kurulum dosyası indirildi; kurulumdan önce geçerli Authenticode imzası koşulu uygulandı.
- Qwen3 8B indirildi; Ollama SHA-256 doğrulaması başarılı.
- Model kimliği: 500a1f067a9f.
- Ollama `ps`: %100 GPU, yaklaşık 5,6 GB model belleği, 4096 bağlam.
- NVIDIA: RTX 4080 Laptop GPU, 12282 MiB, sürücü 592.00.
- Uygulama: http://127.0.0.1:3100 . Ollama bağlantısı: http://127.0.0.1:11434 .
- İlk gerçek ajan çalıştırması 87,5 saniye sürdü. Kayıt değişmedi, taslak oluştu.
- İlk çıktıda kaynağı olmayan sıcaklık aralığı örneği ve zorunluluk bildiren dil görüldü. Ajan talimatı bu davranışları önlemek üzere daraltıldı.
- Model bellekteyken yeni talimatla yapılan ikinci çalıştırma 2,8 saniye sürdü. Taslak oluştu ve kayıt değişmedi. Çıktıda sayısal eşik veya mevzuat zorunluluğu iddiası görülmedi.

Bu iki deneme genel hız veya doğruluk garantisi değildir. Çıktılar uzman incelemesi gerektirir. İlk çalıştırmanın uzun sürmesi nedeniyle sunucu AI zaman aşımı 180 saniyeye, doğrulama aracının süresi 190 saniyeye çıkarıldı.

Çalıştırmaların tam çıktısı yerel `data/store.json` içindeki `runs` alanında ve uygulamanın AI çalışma alanında bulunur. Gerçek model doğrulaması `node verify-ai.mjs` ile tekrarlanabilir; her deneme yeni bir çalıştırma kaydı oluşturur.
