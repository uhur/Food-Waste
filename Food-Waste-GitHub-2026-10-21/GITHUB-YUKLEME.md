# GitHub kaynak paketi

Bu depo Food & Waste SaaS, web arayüzü, PostgreSQL depolama, Ollama ajanları ve ChatGPT MCP sunucusunun kaynak kodudur. Kırmızı hap / karakter koçu fikri henüz uygulanmadı ve bu pakette ayrı ürün olarak bulunmaz.

ZIP dosyasını açın ve içindeki dosyaları GitHub deposunun köküne yükleyin. ZIP'in kendisini yüklemek yerine klasör içeriğini yükleyin; .gitignore ve .env.example dosyalarını da ekleyin. Git ile yükleyecekseniz önce git status çıktısını kontrol edin.

Yeni bilgisayarda Node.js 22+, pnpm ve Ollama kurun. pnpm install --frozen-lockfile çalıştırın. .env.example dosyasını .env olarak kopyalayıp kendi PostgreSQL bağlantınızı yapılandırın. node server.mjs ile web uygulamasını, node chatgpt/server.mjs ile MCP sunucusunu başlatın. Ayrıntılar README.md ve CHATGPT-KURULUM.md içindedir. Veritabanı tabloları depolama koduyla oluşturulur; bu paket mevcut kayıtları içermez.

Gizli .env, yerel anahtarlar/tünel çalışma dosyaları, kullanıcı kayıtları, belgeler, veritabanı yedekleri, günlükler, ekran görüntüleri ve node_modules pakete alınmaz. Hesaba özel bağlantı kimlikleri paket kopyasında yer tutuculara dönüştürülür. Yeni kurulum kendi tünelini ve anahtarını kullanmalıdır.

Bu bir geliştirme demosudur: kullanıcı girişi ve şirket yalıtımı tamamlanmadan genel internet yayınına uygun değildir. Native Android/iOS kaynak projeleri henüz yoktur. Bu dosyaların GitHub'a yüklenmesi uygulamayı otomatik yayımlamaz. Lisans henüz seçilmemiştir.

Kaynak paketini tekrar üretmek için node scripts/export-source.mjs çalıştırın; exports/food-waste-source klasörünü ZIP olarak sıkıştırın. SOURCE-MANIFEST.json dosya listesini ve SHA-256 özetlerini içerir. Yeni dosya eklendiğinde paket içeriğini tekrar gözden geçirin.
