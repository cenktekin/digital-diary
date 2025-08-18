# Dijital Günlük Asistanı

Yapay zeka destekli bu uygulama, tarayıcı geçmişinizi analiz ederek günlük dijital aktivitelerinizden anlamlı ve kişisel bir günlük oluşturur.

## 🚀 Özellikler

- **Tarayıcı Geçmişi Analizi**: `.csv` dosyası veya kopyala-yapıştır metin ile tarayıcı geçmişinizi yükleyin.
- **Yapay Zeka Destekli Özet**: Google Gemini modeli, verilerinizi analiz ederek gününüzü zaman akışına (sabah, öğlen, akşam) göre özetler.
- **Detaylı Raporlama**:
  - Günün önemli anları ve ikonlarla zenginleştirilmiş aktiviteler.
  - Aktivite kategorilerine göre dağılım grafiği.
  - Üretkenlik, Öğrenme, Keşif ve Eğlence alanlarında 5 üzerinden puanlama ve geri bildirimler.
- **Sonuçları Dışa Aktarma**: Oluşturulan günlüğü PNG olarak indirin, metin olarak kopyalayın veya sosyal medyada paylaşın.

## ✨ Yeni Özellikler (v2.0)

- **Google Hesabı ile Entegrasyon**: Günlüklerinizi güvenle saklamak için Google hesabınızla giriş yapın (Simülasyon).
- **Yerel Depolama**: Oluşturduğunuz günlükleri tek tuşla tarayıcınızın yerel depolamasına kaydedin.
- **Takvim Görünümü (Heatmap)**: Kaydettiğiniz tüm günlükleri bir takvim üzerinde görüntüleyin. Aylık ve Yıllık görünümler arasında geçiş yapın. Günlerin aktivite yoğunluğuna göre renklendirildiği bu heatmap ile dijital alışkanlıklarınızı bir bakışta görün.
- **Genel Bakış ve Öneriler**: Tüm günlükleriniz üzerinden yapılan genel bir analizle dijital kişiliğinizi, alışkanlık trendlerinizi ve kişiselleştirilmiş önerileri keşfedin.
- **Tema Seçimi**: Göz zevkinize göre Açık ve Koyu tema arasında geçiş yapın.
- **Çoklu Dil Desteği**: Uygulamayı Türkçe ve İngilizce dillerinde kullanın.

## 🛠️ Nasıl Çalışır?

1.  **Veri Girişi**: "Günlük Oluştur" sekmesinde, tarayıcı geçmişinizi .csv dosyası olarak yükleyin veya doğrudan metin alanına yapıştırın.
2.  **Analiz**: "Günümü Analiz Et" butonuna tıklayın. Yapay zeka verilerinizi işlerken kısa bir süre bekleyin.
3.  **Sonuç**: Kişisel dijital günlüğünüz hazır! Detaylı raporu inceleyin.
4.  **Kaydet ve Görüntüle**:
    - "Kaydet" butonu ile günlüğünüzü ileride erişmek üzere kaydedin.
    - "Kayıtlarım" sekmesinden geçmiş günlüklerinizi takvim üzerinde görün.
5.  **Genel Analiz**: Yeterli veri biriktirdiğinizde, "Genel Bakış" sekmesine giderek dijital alışkanlıklarınız hakkında derinlemesine bilgi ve öneriler alın.

##  Gizlilik

Gizliliğiniz bizim için önemlidir. Girdiğiniz veriler, analiz amacıyla Google Gemini API'sine gönderilir. **Google Entegrasyonu** simüle edilmiştir ve verileriniz sunucularımızda **saklanmaz**, sadece sizin tarayıcınızın yerel depolama alanında tutulur.

## 💻 Kullanılan Teknologiler

- React
- TypeScript
- Tailwind CSS
- Google Gemini API (`@google/genai`)
- Recharts (Grafikler için)
- html-to-image (PNG'ye dönüştürmek için)