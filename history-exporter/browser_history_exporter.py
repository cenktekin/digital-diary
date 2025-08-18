#!/usr/bin/env python3
"""
Gelişmiş Chromium Tabanlı Tarayıcı Geçmiş Export Aracı
Chrome, Edge, Brave, Chromium, Opera, Vivaldi ve tüm varyantlarını destekler.
"""

import sqlite3
import os
import json
import csv
import shutil
from datetime import datetime, timedelta
from pathlib import Path
import argparse
import sys

class BrowserHistoryExporter:
    def __init__(self):
        self.browser_configs = {
            'chrome': {
                'name': 'Google Chrome',
                'paths': {
                    'linux': ['~/.config/google-chrome', '~/.config/google-chrome-beta', '~/.config/google-chrome-unstable'],
                    'darwin': ['~/Library/Application Support/Google/Chrome', '~/Library/Application Support/Google/Chrome Beta', '~/Library/Application Support/Google/Chrome Canary'],
                    'win32': [r'%LOCALAPPDATA%\Google\Chrome\User Data', r'%LOCALAPPDATA%\Google\Chrome Beta\User Data', r'%LOCALAPPDATA%\Google\Chrome SxS\User Data']
                }
            },
            'chromium': {
                'name': 'Chromium',
                'paths': {
                    'linux': ['~/.config/chromium'],
                    'darwin': ['~/Library/Application Support/Chromium'],
                    'win32': [r'%LOCALAPPDATA%\Chromium\User Data']
                }
            },
            'edge': {
                'name': 'Microsoft Edge',
                'paths': {
                    'linux': ['~/.config/microsoft-edge', '~/.config/microsoft-edge-beta', '~/.config/microsoft-edge-dev'],
                    'darwin': ['~/Library/Application Support/Microsoft Edge', '~/Library/Application Support/Microsoft Edge Beta', '~/Library/Application Support/Microsoft Edge Dev'],
                    'win32': [r'%LOCALAPPDATA%\Microsoft\Edge\User Data', r'%LOCALAPPDATA%\Microsoft\Edge Beta\User Data', r'%LOCALAPPDATA%\Microsoft\Edge Dev\User Data']
                }
            },
            'brave': {
                'name': 'Brave Browser',
                'paths': {
                    'linux': ['~/.config/BraveSoftware/Brave-Browser', '~/.config/BraveSoftware/Brave-Browser-Beta', '~/.config/BraveSoftware/Brave-Browser-Dev'],
                    'darwin': ['~/Library/Application Support/BraveSoftware/Brave-Browser', '~/Library/Application Support/BraveSoftware/Brave-Browser-Beta'],
                    'win32': [r'%LOCALAPPDATA%\BraveSoftware\Brave-Browser\User Data', r'%LOCALAPPDATA%\BraveSoftware\Brave-Browser-Beta\User Data']
                }
            },
            'opera': {
                'name': 'Opera',
                'paths': {
                    'linux': ['~/.config/opera', '~/.config/opera-beta', '~/.config/opera-developer'],
                    'darwin': ['~/Library/Application Support/com.operasoftware.Opera', '~/Library/Application Support/com.operasoftware.OperaNext'],
                    'win32': [r'%APPDATA%\Opera Software\Opera Stable', r'%APPDATA%\Opera Software\Opera Next', r'%APPDATA%\Opera Software\Opera Developer']
                }
            },
            'vivaldi': {
                'name': 'Vivaldi',
                'paths': {
                    'linux': ['~/.config/vivaldi'],
                    'darwin': ['~/Library/Application Support/Vivaldi'],
                    'win32': [r'%LOCALAPPDATA%\Vivaldi\User Data']
                }
            }
        }
    
    def get_platform(self):
        """Platform bilgisini döndürür"""
        import platform
        system = platform.system().lower()
        if system == 'darwin':
            return 'darwin'
        elif system == 'windows':
            return 'win32'
        else:
            return 'linux'
    
    def find_installed_browsers(self):
        """Sistemde yüklü olan tüm Chromium tabanlı tarayıcıları bulur"""
        platform = self.get_platform()
        installed_browsers = []
        
        for browser_key, config in self.browser_configs.items():
            if platform not in config['paths']:
                continue
                
            for base_path in config['paths'][platform]:
                expanded_path = os.path.expanduser(os.path.expandvars(base_path))
                
                if os.path.exists(expanded_path):
                    # Profilleri bul (Default, Profile 1, Profile 2, vb.)
                    profiles = self.find_profiles(expanded_path)
                    
                    for profile_name, profile_path in profiles:
                        history_file = os.path.join(profile_path, 'History')
                        if os.path.exists(history_file):
                            # Tarayıcı versiyonunu tespit et
                            version_info = self.detect_browser_version(expanded_path, base_path)
                            
                            browser_info = {
                                'key': f"{browser_key}_{profile_name}_{hash(expanded_path) % 1000}",
                                'name': config['name'],
                                'version': version_info,
                                'profile': profile_name,
                                'path': expanded_path,
                                'history_file': history_file
                            }
                            installed_browsers.append(browser_info)
        
        return installed_browsers
    
    def find_profiles(self, browser_path):
        """Tarayıcı dizinindeki profilleri bulur"""
        profiles = []
        
        # Default profil
        default_path = os.path.join(browser_path, 'Default')
        if os.path.exists(default_path):
            profiles.append(('Default', default_path))
        
        # Diğer profiller (Profile 1, Profile 2, vb.)
        try:
            for item in os.listdir(browser_path):
                item_path = os.path.join(browser_path, item)
                if os.path.isdir(item_path) and item.startswith('Profile '):
                    profiles.append((item, item_path))
        except PermissionError:
            pass
        
        return profiles
    
    def detect_browser_version(self, browser_path, original_path):
        """Tarayıcı versiyonunu tespit eder"""
        path_lower = original_path.lower()
        
        if 'beta' in path_lower:
            return 'Beta'
        elif 'dev' in path_lower or 'developer' in path_lower:
            return 'Developer'
        elif 'canary' in path_lower:
            return 'Canary'
        elif 'unstable' in path_lower:
            return 'Unstable'
        elif 'sxs' in path_lower:
            return 'Canary'
        else:
            return 'Stable'
    
    def display_browser_menu(self, browsers):
        """Kullanıcıya tarayıcı seçim menüsü gösterir"""
        if not browsers:
            print("❌ Hiçbir Chromium tabanlı tarayıcı bulunamadı!")
            return None
        
        # Eğer sadece bir tarayıcı varsa otomatik seç
        if len(browsers) == 1:
            browser = browsers[0]
            profile_text = f" ({browser['profile']})" if browser['profile'] != 'Default' else ""
            version_text = f" - {browser['version']}" if browser['version'] != 'Stable' else ""
            
            print(f"\n✅ Tek tarayıcı bulundu, otomatik seçiliyor:")
            print(f"   {browser['name']}{version_text}{profile_text}")
            print(f"   📁 {browser['path']}")
            return browser
        
        print("\n🔍 Bulunan Tarayıcılar:")
        print("=" * 60)
        
        for i, browser in enumerate(browsers, 1):
            profile_text = f" ({browser['profile']})" if browser['profile'] != 'Default' else ""
            version_text = f" - {browser['version']}" if browser['version'] != 'Stable' else ""
            
            print(f"{i:2d}. {browser['name']}{version_text}{profile_text}")
            print(f"     📁 {browser['path']}")
        
        print("\n" + "=" * 60)
        
        while True:
            try:
                choice = input(f"Seçiminizi yapın (1-{len(browsers)}) veya 'q' ile çıkın: ").strip()
                
                # Boş input kontrolü
                if not choice:
                    print("❌ Lütfen bir seçim yapın!")
                    continue
                
                # Çıkış kontrolü
                if choice.lower() in ['q', 'quit', 'exit', 'çık']:
                    return None
                
                # Sayı kontrolü - daha detaylı
                try:
                    choice_num = int(choice)
                    if 1 <= choice_num <= len(browsers):
                        return browsers[choice_num - 1]
                    else:
                        print(f"❌ Lütfen 1-{len(browsers)} arasında bir sayı girin! (Girilen: {choice})")
                except ValueError:
                    print(f"❌ '{choice}' geçerli bir sayı değil! Lütfen 1-{len(browsers)} arasında bir sayı girin.")
                    
            except KeyboardInterrupt:
                print("\n\n👋 Çıkılıyor...")
                return None
            except EOFError:
                print("\n\n👋 Çıkılıyor...")
                return None  
  
    def copy_history_file(self, source_path):
        """Geçmiş dosyasını geçici bir konuma kopyalar (tarayıcı açıkken erişim için)"""
        if not os.path.exists(source_path):
            return None
        
        temp_path = f"{source_path}.temp"
        try:
            shutil.copy2(source_path, temp_path)
            return temp_path
        except Exception as e:
            print(f"❌ Dosya kopyalama hatası: {e}")
            return None
    
    def chrome_timestamp_to_datetime(self, chrome_timestamp):
        """Chrome timestamp'ini datetime objesine çevirir"""
        if chrome_timestamp == 0:
            return None
        
        # Chrome epoch: 1601-01-01 00:00:00 UTC
        unix_timestamp = (chrome_timestamp - 11644473600000000) / 1000000
        return datetime.fromtimestamp(unix_timestamp)
    
    def extract_history(self, browser_info, days=None):
        """Belirtilen tarayıcının geçmişini çıkarır"""
        history_path = browser_info['history_file']
        
        print(f"📖 {browser_info['name']} geçmişi okunuyor...")
        print(f"📁 Dosya: {history_path}")
        
        # Dosyayı geçici konuma kopyala
        temp_path = self.copy_history_file(history_path)
        if not temp_path:
            print("❌ Geçmiş dosyası kopyalanamadı")
            return None
        
        try:
            conn = sqlite3.connect(temp_path)
            cursor = conn.cursor()
            
            # Temel sorgu
            query = """
            SELECT 
                urls.url,
                urls.title,
                urls.visit_count,
                urls.typed_count,
                urls.last_visit_time,
                visits.visit_time,
                visits.visit_duration
            FROM urls 
            LEFT JOIN visits ON urls.id = visits.url
            WHERE urls.url != ''
            """
            
            # Gün filtresi ekle
            if days:
                cutoff_date = datetime.now() - timedelta(days=days)
                chrome_cutoff = int((cutoff_date.timestamp() + 11644473600) * 1000000)
                query += f" AND urls.last_visit_time > {chrome_cutoff}"
            
            query += " ORDER BY urls.last_visit_time DESC"
            
            cursor.execute(query)
            results = cursor.fetchall()
            
            history_data = []
            for row in results:
                url, title, visit_count, typed_count, last_visit_time, visit_time, visit_duration = row
                
                # Timestamp'leri çevir
                last_visit = self.chrome_timestamp_to_datetime(last_visit_time) if last_visit_time else None
                visit_datetime = self.chrome_timestamp_to_datetime(visit_time) if visit_time else None
                
                history_entry = {
                    'url': url,
                    'title': title or 'Başlık Yok',
                    'visit_count': visit_count,
                    'typed_count': typed_count,
                    'last_visit_time': last_visit.isoformat() if last_visit else None,
                    'visit_time': visit_datetime.isoformat() if visit_datetime else None,
                    'visit_duration': visit_duration,
                    'browser': browser_info['name'],
                    'profile': browser_info['profile'],
                    'version': browser_info['version']
                }
                history_data.append(history_entry)
            
            conn.close()
            
            # Geçici dosyayı sil
            os.remove(temp_path)
            
            print(f"✅ {len(history_data)} geçmiş kaydı bulundu")
            return history_data
            
        except Exception as e:
            print(f"❌ Veritabanı okuma hatası: {e}")
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return None
    
    def save_to_csv(self, data, filename):
        """Veriyi CSV formatında kaydeder"""
        if not data:
            print("❌ Kaydedilecek veri yok")
            return False
        
        try:
            with open(filename, 'w', newline='', encoding='utf-8') as f:
                # CSV başlıkları
                fieldnames = [
                    'url', 'title', 'visit_count', 'typed_count', 
                    'last_visit_time', 'visit_time', 'visit_duration',
                    'browser', 'profile', 'version'
                ]
                
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(data)
            
            print(f"✅ Geçmiş CSV formatında kaydedildi: {filename}")
            return True
            
        except Exception as e:
            print(f"❌ CSV kaydetme hatası: {e}")
            return False
    
    def save_to_json(self, data, filename):
        """Veriyi JSON formatında kaydeder"""
        if not data:
            print("❌ Kaydedilecek veri yok")
            return False
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            print(f"✅ Geçmiş JSON formatında kaydedildi: {filename}")
            return True
            
        except Exception as e:
            print(f"❌ JSON kaydetme hatası: {e}")
            return False
    
    def save_to_html(self, data, filename):
        """Veriyi HTML formatında kaydeder"""
        if not data:
            print("❌ Kaydedilecek veri yok")
            return False
        
        try:
            html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Tarayıcı Geçmişi - {data[0]['browser']} {data[0]['profile']}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .header {{ background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }}
        table {{ border-collapse: collapse; width: 100%; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background-color: #f2f2f2; position: sticky; top: 0; }}
        .url {{ max-width: 400px; word-break: break-all; }}
        .title {{ max-width: 300px; }}
        .stats {{ text-align: center; }}
        tr:nth-child(even) {{ background-color: #f9f9f9; }}
        .search {{ margin-bottom: 10px; }}
        #searchInput {{ padding: 8px; width: 300px; }}
    </style>
    <script>
        function searchTable() {{
            var input = document.getElementById("searchInput");
            var filter = input.value.toUpperCase();
            var table = document.getElementById("historyTable");
            var tr = table.getElementsByTagName("tr");
            
            for (var i = 1; i < tr.length; i++) {{
                var td = tr[i].getElementsByTagName("td");
                var found = false;
                for (var j = 0; j < td.length; j++) {{
                    if (td[j] && td[j].innerHTML.toUpperCase().indexOf(filter) > -1) {{
                        found = true;
                        break;
                    }}
                }}
                tr[i].style.display = found ? "" : "none";
            }}
        }}
    </script>
</head>
<body>
    <div class="header">
        <h1>🌐 Tarayıcı Geçmişi</h1>
        <p><strong>Tarayıcı:</strong> {data[0]['browser']} {data[0]['version']}</p>
        <p><strong>Profil:</strong> {data[0]['profile']}</p>
        <p><strong>Toplam Kayıt:</strong> {len(data)}</p>
        <p><strong>Export Tarihi:</strong> {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}</p>
    </div>
    
    <div class="search">
        <input type="text" id="searchInput" onkeyup="searchTable()" placeholder="Ara...">
    </div>
    
    <table id="historyTable">
        <tr>
            <th>Başlık</th>
            <th>URL</th>
            <th>Ziyaret</th>
            <th>Son Ziyaret</th>
        </tr>
"""
            
            for entry in data:
                last_visit = entry['last_visit_time']
                if last_visit:
                    try:
                        dt = datetime.fromisoformat(last_visit.replace('Z', '+00:00'))
                        last_visit = dt.strftime('%d.%m.%Y %H:%M')
                    except:
                        pass
                
                html_content += f"""
        <tr>
            <td class="title">{entry['title']}</td>
            <td class="url"><a href="{entry['url']}" target="_blank">{entry['url']}</a></td>
            <td class="stats">{entry['visit_count']}</td>
            <td class="stats">{last_visit or 'Bilinmiyor'}</td>
        </tr>
"""
            
            html_content += """
    </table>
</body>
</html>
"""
            
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            print(f"✅ Geçmiş HTML formatında kaydedildi: {filename}")
            return True
            
        except Exception as e:
            print(f"❌ HTML kaydetme hatası: {e}")
            return False

def main():
    parser = argparse.ArgumentParser(description='Gelişmiş Chromium tabanlı tarayıcı geçmiş export aracı')
    parser.add_argument('--auto', '-a', action='store_true', 
                       help='Otomatik mod: ilk bulunan tarayıcıyı kullan')
    parser.add_argument('--days', '-d', type=int, 
                       help='Son N günün geçmişini export et')
    parser.add_argument('--format', '-f', choices=['json', 'csv', 'html'], 
                       default='csv', help='Çıktı formatı (varsayılan: csv)')
    parser.add_argument('--output', '-o', 
                       help='Çıktı dosya adı (belirtilmezse otomatik oluşturulur)')
    parser.add_argument('--list', '-l', action='store_true',
                       help='Sadece bulunan tarayıcıları listele')
    parser.add_argument('--debug', action='store_true',
                       help='Debug modu: detaylı bilgi göster')
    
    args = parser.parse_args()
    
    exporter = BrowserHistoryExporter()
    
    if args.debug:
        print(f"🐛 Debug modu aktif")
        print(f"🖥️  Platform: {exporter.get_platform()}")
    
    print("🔍 Chromium tabanlı tarayıcılar aranıyor...")
    browsers = exporter.find_installed_browsers()
    
    if args.debug:
        print(f"🐛 {len(browsers)} tarayıcı/profil bulundu")
    
    if args.list:
        exporter.display_browser_menu(browsers)
        return
    
    if not browsers:
        print("❌ Hiçbir Chromium tabanlı tarayıcı bulunamadı!")
        sys.exit(1)
    
    # Tarayıcı seçimi
    if args.auto:
        selected_browser = browsers[0]
        print(f"🤖 Otomatik seçim: {selected_browser['name']} {selected_browser['version']} ({selected_browser['profile']})")
    else:
        selected_browser = exporter.display_browser_menu(browsers)
        if not selected_browser:
            print("👋 İptal edildi.")
            sys.exit(0)
    
    # Geçmişi çıkar
    history_data = exporter.extract_history(selected_browser, args.days)
    
    if not history_data:
        print("❌ Geçmiş verisi alınamadı!")
        sys.exit(1)
    
    # Çıktı dosya adını belirle
    if args.output:
        output_file = args.output
    else:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        browser_name = selected_browser['name'].replace(' ', '_').lower()
        profile_name = selected_browser['profile'].replace(' ', '_').lower()
        days_suffix = f"_{args.days}gun" if args.days else ""
        
        output_file = f"{browser_name}_{profile_name}{days_suffix}_{timestamp}.{args.format}"
    
    # Formatına göre kaydet
    success = False
    if args.format == 'csv':
        success = exporter.save_to_csv(history_data, output_file)
    elif args.format == 'json':
        success = exporter.save_to_json(history_data, output_file)
    elif args.format == 'html':
        success = exporter.save_to_html(history_data, output_file)
    
    if success:
        print(f"\n🎉 İşlem tamamlandı!")
        print(f"📊 Toplam kayıt: {len(history_data)}")
        print(f"📁 Dosya: {output_file}")
    else:
        print("❌ Export işlemi başarısız!")
        sys.exit(1)

if __name__ == "__main__":
    main()