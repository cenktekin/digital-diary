#!/usr/bin/env python3
"""
GUI Tarayıcı Geçmiş Export Aracı
Basit grafik arayüzle tarayıcı geçmişinizi export edin.
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import sqlite3
import os
import csv
import shutil
from datetime import datetime, timedelta
import threading

class BrowserExportGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Tarayıcı Geçmiş Export")
        self.root.geometry("500x400")
        
        # Ana frame
        main_frame = ttk.Frame(root, padding="20")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Başlık
        title_label = ttk.Label(main_frame, text="🌐 Tarayıcı Geçmiş Export", 
                               font=('Arial', 16, 'bold'))
        title_label.grid(row=0, column=0, columnspan=2, pady=(0, 20))
        
        # Tarayıcı seçimi
        ttk.Label(main_frame, text="Tarayıcı:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.browser_var = tk.StringVar()
        self.browser_combo = ttk.Combobox(main_frame, textvariable=self.browser_var, 
                                         state="readonly", width=40)
        self.browser_combo.grid(row=1, column=1, sticky=(tk.W, tk.E), pady=5)
        
        # Gün sayısı
        ttk.Label(main_frame, text="Kaç gün:").grid(row=2, column=0, sticky=tk.W, pady=5)
        
        # Gün sayısı frame
        days_frame = ttk.Frame(main_frame)
        days_frame.grid(row=2, column=1, sticky=(tk.W, tk.E), pady=5)
        
        self.days_var = tk.StringVar(value="7")
        days_entry = ttk.Entry(days_frame, textvariable=self.days_var, width=10)
        days_entry.grid(row=0, column=0, sticky=tk.W)
        
        # Tüm geçmiş butonu
        all_history_btn = ttk.Button(days_frame, text="Tümü", 
                                   command=self.set_all_history, width=8)
        all_history_btn.grid(row=0, column=1, padx=(10, 0))
        
        # Bilgi etiketi
        info_label = ttk.Label(main_frame, 
                              text="💡 İpucu: Tüm geçmiş için 'Tümü' butonuna basın veya '0' girin",
                              font=('Arial', 9), foreground='gray')
        info_label.grid(row=3, column=0, columnspan=2, pady=(5, 10))
        
        # Export butonu
        self.export_btn = ttk.Button(main_frame, text="📁 Export Et", 
                                    command=self.export_history)
        self.export_btn.grid(row=4, column=0, columnspan=2, pady=20)
        
        # Progress bar
        self.progress = ttk.Progressbar(main_frame, mode='indeterminate')
        self.progress.grid(row=5, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        # Durum mesajı
        self.status_var = tk.StringVar(value="Hazır")
        status_label = ttk.Label(main_frame, textvariable=self.status_var)
        status_label.grid(row=6, column=0, columnspan=2, pady=5)
        
        # Tarayıcıları yükle
        self.load_browsers()
        
        # Grid weights
        root.columnconfigure(0, weight=1)
        root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
    
    def find_browsers(self):
        """Sistemdeki tarayıcıları bulur"""
        browsers = []
        
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
    
    def load_browsers(self):
        """Tarayıcıları combobox'a yükler"""
        self.browsers = self.find_browsers()
        
        if not self.browsers:
            messagebox.showerror("Hata", "Hiçbir tarayıcı bulunamadı!")
            return
        
        browser_names = [name for name, path in self.browsers]
        self.browser_combo['values'] = browser_names
        
        if browser_names:
            self.browser_combo.current(0)
    
    def set_all_history(self):
        """Tüm geçmiş için 0 değerini ayarlar"""
        self.days_var.set("0")
        self.status_var.set("Tüm geçmiş seçildi")
    
    def export_history_thread(self):
        """Export işlemini ayrı thread'de yapar"""
        try:
            # Seçilen tarayıcıyı bul
            selected_index = self.browser_combo.current()
            if selected_index == -1:
                messagebox.showerror("Hata", "Lütfen bir tarayıcı seçin!")
                return
            
            browser_name, history_file = self.browsers[selected_index]
            
            # Gün sayısını al
            try:
                days = int(self.days_var.get())
                if days < 0:
                    raise ValueError()
            except ValueError:
                messagebox.showerror("Hata", "Geçerli bir gün sayısı girin! (0 = tüm geçmiş)")
                return
            
            if days == 0:
                self.status_var.set(f"{browser_name} - TÜM geçmiş okunuyor...")
            else:
                self.status_var.set(f"{browser_name} - son {days} günün geçmişi okunuyor...")
            
            # Geçici kopya oluştur
            temp_file = history_file + '.temp'
            try:
                shutil.copy2(history_file, temp_file)
            except Exception as e:
                messagebox.showerror("Hata", f"Dosya kopyalanamadı: {e}")
                return
            
            # Veritabanından veri al
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
                # Belirli gün sayısı
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
            
            # CSV dosyası kaydet
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            if days == 0:
                csv_file = f"{browser_name.lower()}_gecmis_tumunu_{timestamp}.csv"
            else:
                csv_file = f"{browser_name.lower()}_gecmis_{days}gun_{timestamp}.csv"
            
            # Dosya konumu sor
            csv_file = filedialog.asksaveasfilename(
                defaultextension=".csv",
                filetypes=[("CSV files", "*.csv"), ("All files", "*.*")],
                initialfile=csv_file
            )
            
            if not csv_file:
                return
            
            self.status_var.set("CSV dosyası oluşturuluyor...")
            
            with open(csv_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(['URL', 'Başlık', 'Ziyaret Sayısı', 'Son Ziyaret'])
                
                for url, title, visit_count, last_visit_time in results:
                    if last_visit_time:
                        unix_time = (last_visit_time - 11644473600000000) / 1000000
                        date_str = datetime.fromtimestamp(unix_time).strftime('%Y-%m-%d %H:%M:%S')
                    else:
                        date_str = 'Bilinmiyor'
                    
                    writer.writerow([url, title or 'Başlık Yok', visit_count, date_str])
            
            conn.close()
            os.remove(temp_file)
            
            # Başarı mesajı
            period_text = "TÜM geçmiş" if days == 0 else f"son {days} günün geçmişi"
            messagebox.showinfo("Başarılı!", 
                              f"✅ {len(results)} kayıt export edildi!\n"
                              f"📅 {period_text}\n"
                              f"📁 Dosya: {os.path.basename(csv_file)}")
            
            self.status_var.set("Hazır")
            
        except Exception as e:
            messagebox.showerror("Hata", f"Export hatası: {e}")
            self.status_var.set("Hata oluştu")
        
        finally:
            self.progress.stop()
            self.export_btn.config(state='normal')
    
    def export_history(self):
        """Export işlemini başlatır"""
        self.export_btn.config(state='disabled')
        self.progress.start()
        
        # Ayrı thread'de çalıştır
        thread = threading.Thread(target=self.export_history_thread)
        thread.daemon = True
        thread.start()

def main():
    root = tk.Tk()
    app = BrowserExportGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()