#!/usr/bin/env python3
"""
Gelişmiş tarayıcı geçmiş export aracını test etmek için test scripti
"""

import os
import sys
from browser_history_exporter import BrowserHistoryExporter

def test_platform_detection():
    """Platform tespitini test eder"""
    exporter = BrowserHistoryExporter()
    platform = exporter.get_platform()
    
    print("🖥️  Platform Testi")
    print("=" * 40)
    print(f"Tespit edilen platform: {platform}")
    print()

def test_browser_detection():
    """Tarayıcı tespitini test eder"""
    exporter = BrowserHistoryExporter()
    
    print("🔍 Tarayıcı Tespit Testi")
    print("=" * 40)
    
    browsers = exporter.find_installed_browsers()
    
    if not browsers:
        print("❌ Hiçbir Chromium tabanlı tarayıcı bulunamadı!")
        return
    
    print(f"✅ {len(browsers)} tarayıcı/profil bulundu:")
    print()
    
    for i, browser in enumerate(browsers, 1):
        profile_text = f" ({browser['profile']})" if browser['profile'] != 'Default' else ""
        version_text = f" - {browser['version']}" if browser['version'] != 'Stable' else ""
        
        print(f"{i:2d}. {browser['name']}{version_text}{profile_text}")
        print(f"     📁 {browser['path']}")
        print(f"     📄 {browser['history_file']}")
        
        # Dosya boyutunu kontrol et
        try:
            size = os.path.getsize(browser['history_file'])
            size_mb = size / (1024 * 1024)
            print(f"     📊 Dosya boyutu: {size_mb:.1f} MB")
        except:
            print(f"     ⚠️  Dosya boyutu okunamadı")
        
        print()

def test_sample_extraction():
    """Örnek veri çıkarma testi"""
    exporter = BrowserHistoryExporter()
    browsers = exporter.find_installed_browsers()
    
    if not browsers:
        print("❌ Test için tarayıcı bulunamadı!")
        return
    
    print("🧪 Örnek Veri Çıkarma Testi")
    print("=" * 40)
    
    # İlk tarayıcıdan son 1 günün geçmişini al
    test_browser = browsers[0]
    print(f"Test tarayıcısı: {test_browser['name']} ({test_browser['profile']})")
    
    try:
        # Son 1 günün geçmişini çıkar
        history_data = exporter.extract_history(test_browser, days=1)
        
        if history_data:
            print(f"✅ {len(history_data)} kayıt bulundu (son 1 gün)")
            
            # İlk 3 kaydı göster
            print("\n📋 Örnek kayıtlar:")
            for i, entry in enumerate(history_data[:3], 1):
                print(f"{i}. {entry['title'][:50]}...")
                print(f"   🔗 {entry['url'][:60]}...")
                print(f"   📅 {entry['last_visit_time']}")
                print()
        else:
            print("❌ Veri çıkarılamadı")
            
    except Exception as e:
        print(f"❌ Test hatası: {e}")

def main():
    print("🧪 Gelişmiş Chromium Tarayıcı Export Aracı - Test Scripti")
    print("=" * 60)
    print()
    
    test_platform_detection()
    test_browser_detection()
    
    # Kullanıcıya sorarak örnek test yap
    try:
        response = input("Örnek veri çıkarma testi yapmak ister misiniz? (y/N): ").strip().lower()
        if response in ['y', 'yes', 'evet', 'e']:
            print()
            test_sample_extraction()
    except KeyboardInterrupt:
        print("\n\n👋 Test iptal edildi")
        return
    
    print("=" * 60)
    print("🎯 Sonraki Adımlar:")
    print("1. Ana scripti çalıştırın:")
    print("   python3 browser_history_exporter.py")
    print()
    print("2. Veya otomatik mod için:")
    print("   python3 browser_history_exporter.py --auto --format csv")

if __name__ == "__main__":
    main()