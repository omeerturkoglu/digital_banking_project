-- =====================================================
-- NOVA BANK — Rapor Uyumluluk Seed Data
-- Seed: 002_rapor_uyumluluk_seed.sql
-- Tarih: 2026-05-14
-- Yazar: Ömer Türkoğlu
--
-- 003_rapor_uyumluluk.sql migration'ından SONRA çalıştırılmalı!
-- =====================================================


-- =====================================================
-- 1. ŞUBELER
-- =====================================================
INSERT INTO branches (branch_code, branch_name, city, address) VALUES
('IST-001', 'Çorlu Şubesi',       'Tekirdağ', 'Çorlu, Muhittin Mah. Bankalar Cad. No:12'),
('IST-002', 'Cerkezköy Şubesi',   'Tekirdağ', 'Cerkezköy, Atatürk Blv. No:45'),
('ANK-001', 'Ankara Merkez Şube', 'Ankara',   'Kızılay, Atatürk Bulvarı No:100');


-- =====================================================
-- 2. KULLANICILARI ŞUBELERE ATA
-- Koray (Müşteri) → Çorlu Şubesi
-- Emir (Admin) → Şubesiz (genel yönetici)
-- Ömer (Müdür) → Çorlu Şubesi
-- Ayşe (Gişe) → Çorlu Şubesi
-- =====================================================
UPDATE users SET branch_id = 1 WHERE tckn = '12345678901';  -- Koray → Çorlu
UPDATE users SET branch_id = NULL WHERE tckn = '98765432101'; -- Emir → Genel Admin
UPDATE users SET branch_id = 1 WHERE tckn = '11223344556';  -- Ömer → Çorlu (Müdür)
UPDATE users SET branch_id = 1 WHERE tckn = '55443322110';  -- Ayşe → Çorlu (Gişe)


-- =====================================================
-- 3. HESAP NUMARALARI GÜNCELLE
-- =====================================================
UPDATE accounts SET account_number = 'NVB-1001-TRY-001' WHERE iban = 'TR120006100011112222330001';
UPDATE accounts SET account_number = 'NVB-1001-TRY-002' WHERE iban = 'TR120006100044445555660002';
UPDATE accounts SET account_number = 'NVB-1001-USD-001' WHERE iban = 'TR120006100077778888990003';
UPDATE accounts SET account_number = 'NVB-1001-EUR-001' WHERE iban = 'TR120006100099990000110004';
UPDATE accounts SET account_number = 'NVB-1003-TRY-001' WHERE iban = 'TR340006200011112222330005';


-- =====================================================
-- 4. KOMİSYON KURALLARI (Admin yönetecek)
-- =====================================================
INSERT INTO commission_rules (rule_name, transaction_type, currency, fixed_amount, percentage_rate, min_amount) VALUES
('EFT Sabit Komisyon',         'EFT',          'TRY', 12.50,  0.0000, 0.00),
('Havale Komisyonu',           'HAVALE',       'TRY', 0.00,   0.0000, 0.00),
('Döviz Alım Komisyonu',      'DOVIZ_ALIM',   'TRY', 0.00,   0.0015, 1000.00),
('Döviz Satım Komisyonu',     'DOVIZ_SATIM',  'TRY', 0.00,   0.0015, 1000.00),
('Yüksek Tutarlı EFT',        'EFT',          'TRY', 25.00,  0.0005, 100000.00);

-- Komisyonları Emir (Admin, id=2) oluşturmuş olsun
UPDATE commission_rules SET updated_by = 2;


-- =====================================================
-- 5. DÖVİZ KUR GEÇMİŞİ (Son 7 günlük simülasyon)
-- =====================================================
INSERT INTO exchange_rate_history (currency_code, buy_rate, sell_rate, source, recorded_at) VALUES
-- USD geçmişi
('USD', 32.10, 32.30, 'TCMB', NOW() - INTERVAL '7 days'),
('USD', 32.15, 32.35, 'TCMB', NOW() - INTERVAL '6 days'),
('USD', 32.22, 32.42, 'TCMB', NOW() - INTERVAL '5 days'),
('USD', 32.30, 32.50, 'TCMB', NOW() - INTERVAL '4 days'),
('USD', 32.28, 32.48, 'TCMB', NOW() - INTERVAL '3 days'),
('USD', 32.38, 32.58, 'TCMB', NOW() - INTERVAL '2 days'),
('USD', 32.45, 32.65, 'TCMB', NOW() - INTERVAL '1 day'),
-- EUR geçmişi
('EUR', 34.80, 35.10, 'TCMB', NOW() - INTERVAL '7 days'),
('EUR', 34.85, 35.15, 'TCMB', NOW() - INTERVAL '6 days'),
('EUR', 34.90, 35.20, 'TCMB', NOW() - INTERVAL '5 days'),
('EUR', 34.95, 35.25, 'TCMB', NOW() - INTERVAL '4 days'),
('EUR', 35.00, 35.30, 'TCMB', NOW() - INTERVAL '3 days'),
('EUR', 35.05, 35.35, 'TCMB', NOW() - INTERVAL '2 days'),
('EUR', 35.10, 35.40, 'TCMB', NOW() - INTERVAL '1 day');


-- =====================================================
-- 6. BÜTÇE KATEGORİLERİ — Yıllık limit güncelle
-- =====================================================
UPDATE budget_categories SET yearly_limit = monthly_limit * 12, period = 'MONTHLY';


-- =====================================================
-- 7. GİŞE MEMURU NAKİT İŞLEM ÖRNEKLERİ
-- =====================================================
INSERT INTO transactions (transaction_ref, from_account_id, to_account_id, amount, currency, transaction_type, status, category, merchant_name, description, created_at, completed_at) VALUES
('TXN-200001', NULL, 1, 5000.00, 'TRY', 'NAKIT_YATIRMA', 'COMPLETED', NULL, 'Gişe İşlemi', 'Müşteri nakit para yatırma — Gişe: Ayşe Yıldız', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('TXN-200002', 1, NULL, 2000.00, 'TRY', 'NAKIT_CEKME',   'COMPLETED', NULL, 'Gişe İşlemi', 'Müşteri nakit para çekme — Gişe: Ayşe Yıldız',   NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');


-- =====================================================
-- Seed data tamamlandı!
-- Eklenen: 3 şube, 5 komisyon kuralı, 14 kur kaydı,
--          2 nakit işlem, hesap numaraları ve şube atamaları
-- =====================================================
