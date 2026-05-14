-- =====================================================
-- NOVA BANK — Test Verileri (Seed Data)
-- Seed: 001_seed_data.sql
-- Tarih: 2026-05-14
-- Yazar: Ömer Türkoğlu
-- =====================================================
-- NOT: Şifreler BCrypt hash'i olarak saklanır.
-- Aşağıdaki hash'ler "password123" şifresine karşılık gelir.
-- Emir backend'de BCrypt kütüphanesi ile doğrulama yapacak.
-- =====================================================

-- =====================================================
-- 1. KULLANICILAR (4 rol, 4 kullanıcı)
-- =====================================================
INSERT INTO users (tckn, first_name, last_name, email, phone, password_hash, role_code) VALUES
('12345678901', 'S. Koray',   'Ölmez',     'koray@novabank.com',   '05301234567', '$2a$12$LJ3m4ys3Grx/dGE.UWoJeOQFjmBMGrOMIk3gB/UhTVd0Jy1fHpGKy', 'CUSTOMER'),
('98765432101', 'İbrahim Emir','Çınkır',   'emir@novabank.com',    '05319876543', '$2a$12$LJ3m4ys3Grx/dGE.UWoJeOQFjmBMGrOMIk3gB/UhTVd0Jy1fHpGKy', 'ADMIN'),
('11223344556', 'Ömer',       'Türkoğlu',  'omer@novabank.com',    '05325551234', '$2a$12$LJ3m4ys3Grx/dGE.UWoJeOQFjmBMGrOMIk3gB/UhTVd0Jy1fHpGKy', 'MANAGER'),
('55443322110', 'Ayşe',       'Yıldız',    'ayse@novabank.com',    '05337778899', '$2a$12$LJ3m4ys3Grx/dGE.UWoJeOQFjmBMGrOMIk3gB/UhTVd0Jy1fHpGKy', 'TELLER');

-- =====================================================
-- 2. BANKA HESAPLARI
-- Koray'ın 3 hesabı, Ömer'in 1 hesabı (test amaçlı)
-- =====================================================
INSERT INTO accounts (user_id, account_type, currency, iban, balance) VALUES
-- Koray (Müşteri) hesapları
(1, 'VADESIZ_TL',    'TRY', 'TR120006100011112222330001', 142500.00),
(1, 'VADESIZ_TL',    'TRY', 'TR120006100044445555660002', 25000.00),
(1, 'VADESIZ_DOVIZ', 'USD', 'TR120006100077778888990003', 4500.00),
(1, 'VADESIZ_DOVIZ', 'EUR', 'TR120006100099990000110004', 0.00),
-- Ömer (Müdür) test hesabı
(3, 'VADESIZ_TL',    'TRY', 'TR340006200011112222330005', 85000.00);

-- =====================================================
-- 3. TRANSFER LİMİTLERİ VE KOMİSYONLAR
-- =====================================================
INSERT INTO transfer_limits (currency, max_amount, fee_type, fee_amount) VALUES
('TRY', 100000.00, 'HAVALE', 0.00),       -- 100K TL üstü havale → müdür onayı
('TRY', 100000.00, 'EFT',    12.50),      -- 100K TL üstü EFT → müdür onayı + 12.50 TL komisyon
('USD', 10000.00,  'HAVALE', 0.00),       -- 10K USD üstü → müdür onayı
('EUR', 10000.00,  'HAVALE', 0.00);       -- 10K EUR üstü → müdür onayı

-- =====================================================
-- 4. DÖVİZ KURLARI (Başlangıç değerleri)
-- =====================================================
INSERT INTO exchange_rates (currency_code, currency_name, buy_rate, sell_rate, trend, source) VALUES
('USD', 'Amerikan Doları',    32.4500, 32.6500, 'up',     'TCMB'),
('EUR', 'Euro',               35.1000, 35.4000, 'up',     'TCMB'),
('GBP', 'İngiliz Sterlini',   40.8500, 41.2500, 'down',   'TCMB'),
('XAU', 'Gram Altın',         2450.5000, 2475.0000, 'up',  'TCMB');

-- =====================================================
-- 5. BÜTÇE KATEGORİLERİ (Koray'ın harcama hedefleri)
-- =====================================================
INSERT INTO budget_categories (user_id, category_name, monthly_limit, color_code) VALUES
(1, 'Market & Gıda',  5000.00,  'bg-emerald-500'),
(1, 'Eğlence',        4000.00,  'bg-blue-500'),
(1, 'Faturalar',      2500.00,  'bg-rose-500'),
(1, 'Ulaşım',         2000.00,  'bg-amber-500'),
(1, 'Eğitim',         3000.00,  'bg-violet-500');

-- =====================================================
-- 6. İŞLEM GEÇMİŞİ (Örnek transferler ve harcamalar)
-- =====================================================
INSERT INTO transactions (transaction_ref, from_account_id, to_account_id, to_iban, amount, currency, transaction_type, transaction_fee, status, category, merchant_name, description, requires_approval, created_at, completed_at) VALUES
-- Tamamlanmış normal işlemler
('TXN-100001', 1, NULL, 'TR980001000044445555660099', 2500.00,  'TRY', 'HAVALE', 0.00,  'COMPLETED', 'Faturalar',     'CK Boğaziçi Elektrik', 'Mayıs ayı elektrik faturası',        false, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('TXN-100002', 1, NULL, 'TR450001000011112222330088', 1250.50,  'TRY', 'EFT',    12.50, 'COMPLETED', 'Market & Gıda', 'Migros A.Ş.',          'Haftalık market alışverişi',          false, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('TXN-100003', 1, NULL, NULL,                         229.99,   'TRY', 'HAVALE', 0.00,  'COMPLETED', 'Eğlence',       'Netflix',              'Aylık abonelik ödemesi',              false, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('TXN-100004', 1, NULL, 'TR670001000099998888770077', 845.00,   'TRY', 'EFT',    12.50, 'COMPLETED', 'Faturalar',     'İGDAŞ',               'Doğalgaz faturası',                   false, NOW() - INTERVAL '1 day',  NOW() - INTERVAL '1 day'),
('TXN-100005', 1, NULL, NULL,                         450.00,   'TRY', 'HAVALE', 0.00,  'COMPLETED', NULL,            'Belirsiz İşlem (POS)', 'POS ile yapılan ödeme',               false, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

-- Döviz işlemleri
('TXN-100006', 1, 3,    NULL,                         1000.00,  'USD', 'DOVIZ_ALIM', 0.00, 'COMPLETED', NULL, NULL,    '1000 USD alım @ 32.45',               false, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
('TXN-100007', 1, 3,    NULL,                         500.00,   'USD', 'DOVIZ_SATIM', 0.00, 'COMPLETED', NULL, NULL,   '500 USD satım @ 32.65',               false, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),

-- Onay bekleyen yüksek tutarlı transferler (Şube müdürü görecek)
('TXN-100008', 1, NULL, 'TR120006000011112222330099', 150000.00, 'TRY', 'HAVALE', 0.00,  'PENDING', NULL, NULL, 'Yüksek tutarlı havale — Ahmet Yılmaz',   true,  NOW() - INTERVAL '2 hours', NULL),
('TXN-100009', 1, NULL, 'TR980001000044445555660066', 450000.00, 'TRY', 'EFT',    12.50, 'PENDING', NULL, NULL, 'Acil EFT talebi — Mehmet Demir',         true,  NOW() - INTERVAL '1 hour',  NULL),
('TXN-100010', 3, NULL, 'US451234567890123456780099', 12000.00,  'USD', 'HAVALE', 0.00,  'PENDING', NULL, NULL, 'Yurtdışı döviz transferi — Ayşe Kaya',   true,  NOW() - INTERVAL '30 minutes', NULL);

-- =====================================================
-- 7. SİSTEM LOGLARI (Admin paneli için örnek kayıtlar)
-- =====================================================
INSERT INTO audit_logs (log_timestamp, level, source, message, user_id, ip_address, metadata) VALUES
(NOW() - INTERVAL '5 minutes', 'CRITICAL', 'Auth Service',     'Çoklu hatalı giriş denemesi tespit edildi.',         3,    '192.168.1.45',  '{"attempts": 5, "role": "MANAGER", "blocked": true}'),
(NOW() - INTERVAL '8 minutes', 'WARNING',  'Transfer API',     'Limit üstü şüpheli transfer! Şube müdürü onayı bekleniyor.', 1, '192.168.1.102', '{"amount": 250000, "currency": "TRY", "txn_ref": "TXN-100009"}'),
(NOW() - INTERVAL '15 minutes','INFO',     'DB Sync',          'PostgreSQL ve Redis önbellek senkronizasyonu başarıyla tamamlandı.', NULL, NULL, '{"sync_time_ms": 145}'),
(NOW() - INTERVAL '20 minutes','INFO',     'Kur Servisi',      'TCMB API üzerinden güncel döviz kurları sisteme çekildi.',  NULL, NULL, '{"currencies": ["USD","EUR","GBP","XAU"]}'),
(NOW() - INTERVAL '35 minutes','ERROR',    'Payment Gateway',  'Dış banka EFT doğrulama servisinde zaman aşımı (Timeout) oluştu.', NULL, '10.0.0.1', '{"timeout_ms": 30000, "bank": "Garanti BBVA"}'),
(NOW() - INTERVAL '60 minutes','INFO',     'System',           'Sistem Yöneticisi giriş yaptı. Oturum başlatıldı.',     2,    '192.168.1.10',  '{"session_id": "sess_abc123"}');

-- =====================================================
-- Seed data tamamlandı!
-- Özet: 4 kullanıcı, 5 hesap, 4 kur, 5 bütçe, 10 işlem, 6 log
-- =====================================================
