# Gelişmiş Chromium Tarayıcı Geçmiş Export Aracı

Bu araç tüm Chromium tabanlı tarayıcıları otomatik tespit eder ve geçmiş bilgilerini export etmenizi sağlar.

## 🚀 Özellikler

- ✅ **Otomatik Tespit**: Tüm Chromium tabanlı tarayıcıları otomatik bulur
- ✅ **Geniş Destek**: Chrome, Chromium, Edge, Brave, Opera, Vivaldi
- ✅ **Tüm Varyantlar**: Stable, Beta, Dev, Canary versiyonları
- ✅ **Çoklu Profil**: Tüm kullanıcı profillerini destekler
- ✅ **Esnek Export**: CSV, JSON, HTML formatları
- ✅ **Tarih Filtresi**: Belirli gün aralığı seçimi
- ✅ **Cross-platform**: Linux, macOS, Windows
- ✅ **Güvenli**: Sadece okuma, orijinal dosyalar korunur

## 📦 Kurulum

```bash
# Python 3.6+ gerekli - ek paket kurulumu gerekmez
python3 browser_history_exporter.py --help
```

## 🎯 Kullanım

### İnteraktif Mod (Önerilen)

```bash
# Bulunan tüm tarayıcıları göster ve seç
python3 browser_history_exporter.py

# Sadece bulunan tarayıcıları listele
python3 browser_history_exporter.py --list
```

### Otomatik Mod

```bash
# İlk bulunan tarayıcıyı otomatik kullan
python3 browser_history_exporter.py --auto

# Son 30 günün geçmişini CSV formatında export et
python3 browser_history_exporter.py --auto --days 30 --format csv
```

### Özel Çıktı

```bash
# HTML formatında özel dosya adıyla kaydet
python3 browser_history_exporter.py --format html --output gecmis_raporu.html

# JSON formatında son 7 günün geçmişi
python3 browser_history_exporter.py --days 7 --format json
```

## 📋 Parametreler

- `--auto, -a`: Otomatik mod (ilk bulunan tarayıcıyı kullan)
- `--days, -d`: Son N günün geçmişini export et
- `--format, -f`: Çıktı formatı (csv, json, html) - **Varsayılan: csv**
- `--output, -o`: Çıktı dosya adı (belirtilmezse otomatik oluşturulur)
- `--list, -l`: Sadece bulunan tarayıcıları listele

## 🎨 Çıktı Formatları

### CSV (Varsayılan)

- Excel, LibreOffice Calc ile açılabilir
- Veri analizi için ideal
- Kolay filtreleme ve sıralama

### JSON

- Programatik kullanım için mükemmel
- API entegrasyonları için uygun
- Tüm metadata bilgileri dahil

### HTML

- Web tarayıcısında görüntülenebilir
- Tıklanabilir linkler
- Arama özelliği dahil
- Güzel görsel sunum

## 🔧 Desteklenen Tarayıcılar

| Tarayıcı           | Stable | Beta | Dev/Canary |
| ------------------ | ------ | ---- | ---------- |
| **Google Chrome**  | ✅     | ✅   | ✅         |
| **Chromium**       | ✅     | -    | -          |
| **Microsoft Edge** | ✅     | ✅   | ✅         |
| **Brave Browser**  | ✅     | ✅   | ✅         |
| **Opera**          | ✅     | ✅   | ✅         |
| **Vivaldi**        | ✅     | -    | -          |

## ⚠️ Önemli Notlar

1. **Tarayıcı Durumu**: Tarayıcı açıkken de çalışır (geçici kopya oluşturur)
2. **Güvenlik**: Orijinal dosyalar hiçbir zaman değiştirilmez
3. **Profiller**: Tüm kullanıcı profilleri otomatik tespit edilir
4. **Platform**: Linux, macOS, Windows tam desteği

## 🐛 Sorun Giderme

### Tarayıcı Bulunamadı

```bash
# Önce hangi tarayıcıların bulunduğunu kontrol edin
python3 browser_history_exporter.py --list
```

### İzin Hatası

```bash
# Linux/macOS'ta yetki gerekebilir
sudo python3 browser_history_exporter.py
```

### Veritabanı Hatası

- Tarayıcıyı yeniden başlatın
- Profil dizinini kontrol edin
- Disk alanını kontrol edin

## 📊 Örnek Çıktı

Export edilen CSV dosyası şu sütunları içerir:

- `url`: Ziyaret edilen URL
- `title`: Sayfa başlığı
- `visit_count`: Toplam ziyaret sayısı
- `last_visit_time`: Son ziyaret tarihi
- `browser`: Tarayıcı adı
- `profile`: Profil adı
- `version`: Tarayıcı versiyonu
