# 🚀 Basit Tarayıcı Geçmiş Export Araçları

3 farklı basitlik seviyesinde araç:

## 1. ⚡ Hızlı Export (En Basit)
Tek komutla son 7 günün geçmişini export eder.

```bash
python3 hizli_export.py
```

**Ne yapar:**
- İlk bulunan tarayıcıyı otomatik seçer
- Son 7 günün geçmişini alır
- CSV dosyasına kaydeder
- Hiç soru sormaz!

---

## 2. 📝 Basit Export (Seçenekli)
Tarayıcı ve gün sayısı seçimi yapabilirsiniz.

```bash
python3 basit_gecmis_export.py
```

**Ne yapar:**
- Bulunan tarayıcıları listeler
- Hangisini istediğinizi sorar
- Kaç günün geçmişini istediğinizi sorar
- CSV dosyasına kaydeder

**Örnek kullanım:**
```
Bulunan tarayıcılar:
1. Chromium
2. Chrome
3. Edge

Hangisini seçiyorsunuz? (1-3): 1
Kaç günün geçmişini istiyorsunuz? (varsayılan: 7, tümü için: 0): 30
```

**Tüm geçmişi indirmek için:**
- Gün sayısı sorusuna `0` yazın
- Veya GUI'de "Tümü" butonuna basın

---

## 3. 🖼️ GUI Export (Grafik Arayüz)
Grafik arayüzle kolay kullanım.

```bash
python3 gui_gecmis_export.py
```

**Ne yapar:**
- Pencere açar
- Dropdown'dan tarayıcı seçersiniz
- Gün sayısını girersiniz
- "Export Et" butonuna basarsınız
- Dosya konumunu seçersiniz

---

## 📊 Çıktı Formatı

Tüm araçlar aynı CSV formatında dosya oluşturur:

| URL | Başlık | Ziyaret Sayısı | Son Ziyaret |
|-----|--------|----------------|-------------|
| https://example.com | Örnek Site | 5 | 2025-08-18 14:30:25 |

## 💡 Hangi Aracı Kullanmalıyım?

- **Hızlı kullanım istiyorum**: `hizli_export.py`
- **Biraz kontrol istiyorum**: `basit_gecmis_export.py`  
- **Grafik arayüz istiyorum**: `gui_gecmis_export.py`
- **Gelişmiş özellikler istiyorum**: `browser_history_exporter.py`

## 🔢 Gün Sayısı Seçenekleri

- **7** (varsayılan): Son 1 hafta
- **30**: Son 1 ay  
- **365**: Son 1 yıl
- **0**: **TÜM GEÇMİŞ** (başlangıçtan itibaren)

## 🔧 Gereksinimler

- Python 3.6+
- Ek paket kurulumu gerekmez!

## ⚠️ Notlar

- Tarayıcı açıkken de çalışır
- Orijinal dosyalarınız değişmez
- Sadece okuma yapar, hiçbir şey silmez