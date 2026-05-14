-- =====================================================
-- NOVA BANK — Rapor Uyumluluk Güncellemesi
-- Migration: 003_rapor_uyumluluk.sql
-- Tarih: 2026-05-14
-- Yazar: Ömer Türkoğlu
--
-- Bu migration, proje raporundaki gereksinimlere göre
-- eksik tabloları ekler ve mevcut tabloları günceller.
-- =====================================================


-- =====================================================
-- 1. BRANCHES — Şube Tablosu (YENİ)
-- Rapor Senaryo 11-12: Şube müdürü kendi şubesinin
-- müşterilerini görecek, admin tüm şubeleri görecek.
-- =====================================================
CREATE TABLE branches (
    id              SERIAL PRIMARY KEY,
    branch_code     VARCHAR(10) UNIQUE NOT NULL,         -- Şube kodu (örn: IST-001)
    branch_name     VARCHAR(100) NOT NULL,               -- Şube adı
    city            VARCHAR(50) NOT NULL,                 -- Şehir
    address         VARCHAR(255),                         -- Adres
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE branches IS 'Banka şubeleri — müdür ve müşteri atamaları bu tabloya bağlıdır';


-- =====================================================
-- 2. USERS tablosuna branch_id ekleme
-- Her kullanıcı bir şubeye bağlı olacak
-- =====================================================
ALTER TABLE users ADD COLUMN branch_id INTEGER REFERENCES branches(id);

COMMENT ON COLUMN users.branch_id IS 'Kullanıcının bağlı olduğu şube (müdür ve müşteri için zorunlu)';


-- =====================================================
-- 3. ACCOUNTS tablosuna account_number ekleme
-- Rapor 4.2.2: "benzersiz hesap numarası VE IBAN"
-- =====================================================
ALTER TABLE accounts ADD COLUMN account_number VARCHAR(20) UNIQUE;

COMMENT ON COLUMN accounts.account_number IS 'Benzersiz hesap numarası (IBAN''dan bağımsız)';


-- =====================================================
-- 4. TRANSACTIONS — İşlem türlerine nakit ekleme
-- Rapor 4.1: Gişe memuru nakit yatırma/çekme yapacak
--
-- PostgreSQL'de CHECK constraint değiştirmek için:
-- Önce esikiyi sil, sonra yenisini ekle
-- =====================================================
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_transaction_type_check;

ALTER TABLE transactions ADD CONSTRAINT transactions_transaction_type_check
    CHECK (transaction_type IN ('HAVALE', 'EFT', 'DOVIZ_ALIM', 'DOVIZ_SATIM', 'NAKIT_YATIRMA', 'NAKIT_CEKME'));

COMMENT ON COLUMN transactions.transaction_type IS 'İşlem türü: HAVALE, EFT, DOVIZ_ALIM, DOVIZ_SATIM, NAKIT_YATIRMA, NAKIT_CEKME';


-- =====================================================
-- 5. COMMISSION_RULES — Komisyon Yönetimi (YENİ)
-- Rapor 4.1: Admin komisyon oranlarını dinamik belirler
-- =====================================================
CREATE TABLE commission_rules (
    id              SERIAL PRIMARY KEY,
    rule_name       VARCHAR(100) NOT NULL,               -- Kural adı (örn: EFT Komisyonu)
    transaction_type VARCHAR(20) NOT NULL,               -- HAVALE, EFT, DOVIZ_ALIM vb.
    currency        VARCHAR(3) NOT NULL DEFAULT 'TRY',
    fixed_amount    DECIMAL(18,2) DEFAULT 0.00,          -- Sabit tutar (örn: 12.50 TL)
    percentage_rate DECIMAL(5,4) DEFAULT 0.0000,         -- Yüzdelik oran (örn: 0.0010 = %0.10)
    min_amount      DECIMAL(18,2) DEFAULT 0.00,          -- Bu tutarın üstündeki işlemlere uygulanır
    is_active       BOOLEAN DEFAULT true,
    updated_by      INTEGER REFERENCES users(id),        -- Son güncelleyen admin
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE commission_rules IS 'Admin tarafından dinamik yönetilen komisyon kuralları';
COMMENT ON COLUMN commission_rules.percentage_rate IS 'Yüzdelik oran: 0.0010 = binde bir, 0.0100 = yüzde bir';


-- =====================================================
-- 6. PASSWORD_RESET_TOKENS — Şifre Sıfırlama (YENİ)
-- Rapor 4.2.1 + Senaryo 1 extend: Şifre sıfırlama akışı
-- =====================================================
CREATE TABLE password_reset_tokens (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token           VARCHAR(255) UNIQUE NOT NULL,         -- Benzersiz sıfırlama token'ı
    expires_at      TIMESTAMP NOT NULL,                   -- Token geçerlilik süresi
    is_used         BOOLEAN DEFAULT false,                -- Kullanıldı mı?
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE password_reset_tokens IS 'Şifre sıfırlama isteklerinin takibi — token süresi dolunca geçersiz olur';


-- =====================================================
-- 7. EXCHANGE_RATE_HISTORY — Döviz Kur Geçmişi (YENİ)
-- Rapor 4.2.5: Kur verileri otonom olarak kaydedilmeli
-- Background job her çalıştığında buraya yazar
-- =====================================================
CREATE TABLE exchange_rate_history (
    id              SERIAL PRIMARY KEY,
    currency_code   VARCHAR(3) NOT NULL,
    buy_rate        DECIMAL(10,4) NOT NULL,
    sell_rate       DECIMAL(10,4) NOT NULL,
    source          VARCHAR(50) DEFAULT 'TCMB',
    recorded_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE exchange_rate_history IS 'Geçmiş döviz kurları — her güncelleme burada arşivlenir';


-- =====================================================
-- 8. BUDGET_CATEGORIES — Yıllık bütçe desteği ekleme
-- Rapor Senaryo 7: "Aylık ve Yıllık Bütçe Hedefleri"
-- =====================================================
ALTER TABLE budget_categories ADD COLUMN yearly_limit DECIMAL(18,2);
ALTER TABLE budget_categories ADD COLUMN period VARCHAR(10) DEFAULT 'MONTHLY' 
    CHECK (period IN ('MONTHLY', 'YEARLY'));

COMMENT ON COLUMN budget_categories.yearly_limit IS 'Yıllık bütçe hedefi (opsiyonel)';
COMMENT ON COLUMN budget_categories.period IS 'Bütçe periyodu: MONTHLY veya YEARLY';


-- =====================================================
-- YENİ TABLOLAR İÇİN INDEX'LER
-- =====================================================

-- Branches
CREATE INDEX idx_branches_code ON branches(branch_code);
CREATE INDEX idx_branches_city ON branches(city);

-- Users branch ilişkisi
CREATE INDEX idx_users_branch_id ON users(branch_id);

-- Accounts hesap numarası
CREATE INDEX idx_accounts_number ON accounts(account_number);

-- Commission Rules
CREATE INDEX idx_commission_rules_type ON commission_rules(transaction_type);
CREATE INDEX idx_commission_rules_active ON commission_rules(is_active);

-- Password Reset Tokens
CREATE INDEX idx_password_reset_user ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_expires ON password_reset_tokens(expires_at);

-- Exchange Rate History
CREATE INDEX idx_rate_history_code ON exchange_rate_history(currency_code);
CREATE INDEX idx_rate_history_time ON exchange_rate_history(recorded_at DESC);
CREATE INDEX idx_rate_history_code_time ON exchange_rate_history(currency_code, recorded_at DESC);


-- =====================================================
-- Migration tamamlandı!
-- Eklenen: 4 yeni tablo + 3 tablo güncellemesi + 13 index
-- =====================================================
