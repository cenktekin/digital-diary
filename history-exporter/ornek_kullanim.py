#!/usr/bin/env python3
"""
Tarayıcı geçmiş export aracının örnek kullanımları
"""

import subprocess
import sys
import os

def run_command(cmd, description):
    """Komut çalıştır ve sonucu göster"""
    print(f"\n🔧 {description}")
    print("=" * 50)
    print(f"Komut: {cmd}")
    print("-" * 50)
    
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        
        if result.stdout:
            print(result.stdout)
        
        if result.stderr:
            print("HATA:", result.stderr)
            
        return result.returncode == 0
        
    except Exception as e:
        print(f"Komut çalıştırma hatası: {e}")
        return False

def main():
    print("📚 Tarayıcı Geçmiş Export Aracı - Örnek Kullanımlar")
    print("=" * 60)
    
    # Script varlığını kontrol et
    if not os.path.exists('browser_history_exporter.py'):
        print("❌ browser_history_exporter.py dosyası bulunamadı!")
        print("Bu scripti ana script ile aynı dizinde çalıştırın.")
        sys.exit(1)
    
    examples = [
        {
            'cmd': 'python3 browser_history_exporter.py --list',
            'desc': 'Sistemdeki tüm tarayıcıları listele'
        },
        {
            'cmd': 'python3 browser_history_exporter.py --auto --format csv',
            'desc': 'Otomatik mod - CSV formatında export'
        },
        {
            'cmd': 'python3 browser_history_exporter.py --auto --days 7 --format html',
            'desc': 'Son 7 günün geçmişini HTML formatında export'
        },
        {
            'cmd': 'python3 browser_history_exporter.py --auto --days 30 --output son_30_gun.csv',
            'desc': 'Son 30 günün geçmişini özel dosya adıyla kaydet'
        }
    ]
    
    print("Aşağıdaki örnekleri çalıştırmak ister misiniz?")
    print("Her örnek için onay istenecek.\n")
    
    for i, example in enumerate(examples, 1):
        try:
            response = input(f"\n{i}. {example['desc']}\n   Çalıştır? (y/N): ").strip().lower()
            
            if response in ['y', 'yes', 'evet', 'e']:
                success = run_command(example['cmd'], example['desc'])
                
                if success:
                    print("✅ Komut başarıyla tamamlandı!")
                else:
                    print("❌ Komut başarısız oldu!")
                    
                input("\nDevam etmek için Enter'a basın...")
            else:
                print("⏭️  Atlandı")
                
        except KeyboardInterrupt:
            print("\n\n👋 Çıkılıyor...")
            break
    
    print("\n" + "=" * 60)
    print("🎉 Örnek kullanımlar tamamlandı!")
    print("\n💡 İpucu: Daha fazla seçenek için şu komutu çalıştırın:")
    print("python3 browser_history_exporter.py --help")

if __name__ == "__main__":
    main()