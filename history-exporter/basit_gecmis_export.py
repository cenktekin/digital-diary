#!/usr/bin/env python3
"""
Basit Tarayıcı Geçmiş Export Aracı
Tek tuşla tarayıcı geçmişinizi CSV dosyasına aktarır.
"""

import sqlite3
import os
import csv
import shutil
from datetime import datetime, timedelta

def find_browsers():
    """Sistemdeki tarayıcıları bulur"""
    browsers = []
    
    # Chrome/Chromium yolları
    paths = [
        ('Chrome', '~/.config/google-chrome/Default/History'),
        ('Chromium', '~/.config/chromium/Default/History'),
        ('Edge', '~/.config/microsoft-edge/Default/History'),
        ('Edge Dev', '~/.config/microsoft-edge-dev/Default/History'),
        ('Brave', '~/.config/BraveSoftware/Brave-Browser/Default/History'),
        ('Opera', '~/.config/opera/Default/History'),
        ('Opera Dev', '~/.config/opera-developer/Default/History'),
    ]
    
    for name, path in paths:
        full_path = os.path.expanduser(path)
        if os.path.exists(full_path):
            browsers.append((name, full_path))
    
    return browsers

def export_history(history_file, days=7):
    """Geçmişi CSV'ye export eder"""
    # Geçici kopya oluştur
    temp_file = history_file + '.temp'
    try:
        shutil.copy2(history_file, temp_file)
    except:
        print("❌ Dosya kopyalanamadı. Tarayıcıyı kapatıp tekrar deneyin.")
        return None
    
    try:
        conn = sqlite3.connect(temp_file)
        cursor = conn.cursor()
        
        if days == 0:
            # Tüm geçmiş
            query = """
            SELECT url, title, visit_count, last_visit_time
            FROM urls 
            WHERE url != ''
            ORDER BY last_visit_time DESC
            """
            cursor.execute(query)
        else:
            # Son N günün geçmişini al
            cutoff_date = datetime.now() - timedelta(days=days)
            chrome_cutoff = int((cutoff_date.timestamp() + 11644473600) * 1000000)
            
            query = """
            SELECT url, title, visit_count, last_visit_time
            FROM urls 
            WHERE last_visit_time > ? AND url != ''
            ORDER BY last_visit_time DESC
            """
            cursor.execute(query, (chrome_cutoff,))
        
        results = cursor.fetchall()
        
        # CSV dosyası oluştur
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        if days == 0:
            csv_file = f"gecmis_tumunu_{timestamp}.csv"
        else:
            csv_file = f"gecmis_{days}gun_{timestamp}.csv"
        
        with open(csv_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['URL', 'Başlık', 'Ziyaret Sayısı', 'Son Ziyaret'])
            
            for url, title, visit_count, last_visit_time in results:
                # Timestamp'i tarihe çevir
                if last_visit_time:
                    unix_time = (last_visit_time - 11644473600000000) / 1000000
                    date_str = datetime.fromtimestamp(unix_time).strftime('%Y-%m-%d %H:%M:%S')
                else:
                    date_str = 'Bilinmiyor'
                
                writer.writerow([url, title or 'Başlık Yok', visit_count, date_str])
        
        conn.close()
        os.remove(temp_file)
        
        return csv_file, len(results)
        
    except Exception as e:
        print(f"❌ Hata: {e}")
        if os.path.exists(temp_file):
            os.remove(temp_file)
        return None

def main():
    print("🌐 Basit Tarayıcı Geçmiş Export Aracı")
    print("=" * 40)
    
    # Tarayıcıları bul
    browsers = find_browsers()
    
    if not browsers:
        print("❌ Hiçbir tarayıcı bulunamadı!")
        return
    
    # Tarayıcıları göster
    print("Bulunan tarayıcılar:")
    for i, (name, path) in enumerate(browsers, 1):
        print(f"{i}. {name}")
    
    # Seçim yap
    while True:
        try:
            choice = input(f"\nHangisini seçiyorsunuz? (1-{len(browsers)}): ").strip()
            choice_num = int(choice)
            if 1 <= choice_num <= len(browsers):
                selected_browser = browsers[choice_num - 1]
                break
            else:
                print(f"1-{len(browsers)} arasında bir sayı girin!")
        except:
            print("Geçerli bir sayı girin!")
    
    # Gün sayısı sor
    while True:
        try:
            days_input = input("Kaç günün geçmişini istiyorsunuz? (varsayılan: 7, tümü için: 0): ").strip()
            if not days_input:
                days = 7
            else:
                days = int(days_input)
                if days < 0:
                    print("0 veya pozitif bir sayı girin! (0 = tüm geçmiş)")
                    continue
            break
        except:
            print("Geçerli bir sayı girin! (0 = tüm geçmiş)")
    
    if days == 0:
        print(f"\n📖 {selected_browser[0]} - TÜM geçmiş export ediliyor...")
    else:
        print(f"\n📖 {selected_browser[0]} - son {days} günün geçmişi export ediliyor...")
    
    # Export et
    result = export_history(selected_browser[1], days)
    
    if result:
        csv_file, count = result
        print(f"✅ Başarılı!")
        print(f"📊 {count} kayıt export edildi")
        print(f"📁 Dosya: {csv_file}")
        print(f"\n💡 Bu dosyayı Excel ile açabilirsiniz.")
    else:
        print("❌ Export başarısız!")

if __name__ == "__main__":
    main()