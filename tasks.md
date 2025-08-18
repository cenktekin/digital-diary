# Dijital Günlük Asistanı - Geliştirme Görevleri

Bu dosya, uygulamaya eklenecek yeni özelliklerin ve yapılacak geliştirmelerin bir listesini içerir.

## Epic 1: Kullanıcı Hesabı ve Veri Yönetimi

### User Story
Bir kullanıcı olarak, dijital günlüklerimi güvenli bir şekilde saklamak ve onlara daha sonra erişmek için Google hesabımla giriş yapabilmek istiyorum.

### Görevler
- [x] **Task 1.1:** Google ile Giriş/Çıkış Arayüzü
- [x] **Task 1.2:** Veri Saklama Simülasyonu (Tarayıcı Depolaması)
- [x] **Task 1.3:** Veri Kalıcılığı için Servis Katmanı

## Epic 2: Veri Görselleştirme ve Analiz

### User Story
Bir kullanıcı olarak, geçmiş dijital günlüklerimi bir takvim üzerinde görmek ve tüm aktivitelerim hakkında genel bir analiz ve öneriler almak istiyorum.

### Görevler
- [x] **Task 2.1:** Takvim Heatmap Görünümü (Aylık)
- [x] **Task 2.2:** Genel Bakış ve Öneri Sistemi
- [x] **Task 2.3:** Takvim Yıl Görünümü
    - [x] Aylar arasında geçişe ek olarak, mevcut yılın tamamını gösteren bir görünüm ekle.
    - [x] Yıl görünümünden bir aya tıklandığında aylık detaya geçişi sağla.
    - [x] Yıllar arasında gezinme imkanı sun.
- [x] **Task 2.4:** Örnek Veri Entegrasyonu
    - [x] Uygulama ilk açıldığında, kullanıcının özellikleri test edebilmesi için birkaç haftalık örnek günlük verisi oluştur.

## Epic 3: Arayüz ve Kullanıcı Deneyimi Geliştirmeleri

### User Story
Bir kullanıcı olarak, uygulamayı daha rahat kullanmak, görünümünü kişiselleştirmek ve analiz sonuçlarını kolayca paylaşmak istiyorum.

### Görevler
- [x] **Task 3.1:** Sosyal Paylaşım Özelliği
- [x] **Task 3.2:** Arayüz Düzenlemeleri (Buton boyutları)
- [x] **Task 3.3:** Tema Seçimi (Açık/Koyu Mod)
    - [x] Kullanıcının açık ve koyu tema arasında geçiş yapabilmesini sağlayan bir buton ekle.
    - [x] Tema tercihini `localStorage`'da sakla.
- [x] **Task 3.4:** Çoklu Dil Desteği (i18n)
    - [x] Uygulamaya İngilizce dil desteği ekle.
    - [x] Kullanıcının diller arasında geçiş yapabilmesini sağlayan bir mekanizma oluştur.
    - [x] Dil tercihini `localStorage`'da sakla.
    - [x] Gemini API'ye gönderilen prompt'ların seçilen dile göre güncellenmesini sağla.

## Epic 4: Proje Dokümantasyonu

### Görevler
- [x] **Task 4.1:** README Dosyası Güncellemesi
- [x] **Task 4.2:** Görev Takip Dosyası