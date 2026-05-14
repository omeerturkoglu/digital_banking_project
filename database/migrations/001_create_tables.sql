-- =====================================================
-- NOVA BANK — Veritabanı Tabloları
-- Migration: 001_create_tables.sql
-- Tarih: 2026-05-14
-- Yazar: Ömer Türkoğlu
-- =====================================================

-- Temiz başlangıç için mevcut tabloları sil (geliştirme ortamı için)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS budget_categories CASCADE;
DROP TABLE IF EXISTS exchange_rates CASCADE;
DROP TABLE IF EXISTS transfer_limits CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- 1. USERS — Kullanıcı Tablosu
-- Tüm roller: CUSTOMER, ADMIN, MANAGER, TELLER
-- =====================================================
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    tckn            VARCHAR(11) UNIQUE NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(15),
    password_hash   VARCHAR(255) NOT NULL,
    role_code       VARCHAR(20) NOT NULL CHECK (role_code IN ('CUSTOMER', 'ADMIN', 'MANAGER', 'TELLER')),
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'Sisteme giriş yapabilen tüm kullanıcılar (müşteri, admin, müdür, gişe memuru)';
COMMENT ON COLUMN users.tckn IS 'TC Kimlik Numarası — 11 haneli, benzersiz';
COMMENT ON COLUMN users.role_code IS 'Kullanıcı rolü: CUSTOMER, ADMIN, MANAGER, TELLER';
COMMENT ON COLUMN users.password_hash IS 'BCrypt ile hashlenmiş şifre';

-- =====================================================
-- 2. ACCOUNTS — Banka Hesapları
-- Her müşterinin birden fazla hesabı olabilir (TL, USD, EUR)
-- =====================================================
CREATE TABLE accounts (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_type    VARCHAR(20) NOT NULL CHECK (account_type IN ('VADESIZ_TL', 'VADESIZ_DOVIZ')),
    currency        VARCHAR(3) NOT NULL DEFAULT 'TRY' CHECK (currency IN ('TRY', 'USD', 'EUR', 'GBP')),
    iban            VARCHAR(34) UNIQUE NOT NULL,
    balance         DECIMAL(18,2) DEFAULT 0.00 CHECK (balance >= 0),
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE accounts IS 'Müşterilerin vadesiz TL ve döviz hesapları';
COMMENT ON COLUMN accounts.balance IS 'Hesap bakiyesi — negatif olamaz';
COMMENT ON COLUMN accounts.iban IS 'Uluslararası Banka Hesap Numarası — benzersiz';

-- =====================================================
-- 3. TRANSFER_LIMITS — Transfer Kuralları ve Komisyonlar
-- Şube müdürü onay eşikleri ve işlem ücretleri
-- =====================================================
CREATE TABLE transfer_limits (
    id              SERIAL PRIMARY KEY,
    currency        VARCHAR(3) NOT NULL CHECK (currency IN ('TRY', 'USD', 'EUR', 'GBP')),
    max_amount      DECIMAL(18,2) NOT NULL,
    fee_type        VARCHAR(20) CHECK (fee_type IN ('HAVALE', 'EFT')),
    fee_amount      DECIMAL(18,2) DEFAULT 0.00,
    is_active       BOOLEAN DEFAULT true
);

COMMENT ON TABLE transfer_limits IS 'Transfer limit kuralları — üstü şube müdürü onayı gerektirir';
COMMENT ON COLUMN transfer_limits.max_amount IS 'Bu tutarın üzerindeki transferler onay gerektirir';

-- =====================================================
-- 4. EXCHANGE_RATES — Döviz Kurları
-- TCMB veya manuel güncellenen kur bilgileri
-- =====================================================
CREATE TABLE exchange_rates (
    id              SERIAL PRIMARY KEY,
    currency_code   VARCHAR(3) NOT NULL UNIQUE,
    currency_name   VARCHAR(100) NOT NULL,
    buy_rate        DECIMAL(10,4) NOT NULL,
    sell_rate       DECIMAL(10,4) NOT NULL,
    trend           VARCHAR(10) DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable')),
    source          VARCHAR(50) DEFAULT 'MANUAL',
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE exchange_rates IS 'Güncel döviz kurları — Redis ile de cache''lenir';
COMMENT ON COLUMN exchange_rates.buy_rate IS 'Bankanın alış kuru (müşteri satar)';
COMMENT ON COLUMN exchange_rates.sell_rate IS 'Bankanın satış kuru (müşteri alır)';

-- =====================================================
-- 5. BUDGET_CATEGORIES — Bütçe Kategorileri
-- Müşterinin harcama limitleri ve takibi
-- =====================================================
CREATE TABLE budget_categories (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_name   VARCHAR(50) NOT NULL,
    monthly_limit   DECIMAL(18,2),
    color_code      VARCHAR(20),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE budget_categories IS 'Müşteri bazlı aylık harcama bütçe hedefleri';

-- =====================================================
-- 6. TRANSACTIONS — İşlem Geçmişi
-- Tüm para hareketleri: havale, EFT, döviz alım/satım
-- =====================================================
CREATE TABLE transactions (
    id                  SERIAL PRIMARY KEY,
    transaction_ref     VARCHAR(20) UNIQUE NOT NULL,
    from_account_id     INTEGER REFERENCES accounts(id),
    to_account_id       INTEGER REFERENCES accounts(id),
    to_iban             VARCHAR(34),
    amount              DECIMAL(18,2) NOT NULL CHECK (amount > 0),
    currency            VARCHAR(3) NOT NULL,
    transaction_type    VARCHAR(20) NOT NULL CHECK (transaction_type IN ('HAVALE', 'EFT', 'DOVIZ_ALIM', 'DOVIZ_SATIM')),
    transaction_fee     DECIMAL(18,2) DEFAULT 0.00,
    exchange_rate       DECIMAL(10,4),
    status              VARCHAR(20) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED')),
    category            VARCHAR(50),
    merchant_name       VARCHAR(255),
    description         VARCHAR(500),
    requires_approval   BOOLEAN DEFAULT false,
    approved_by         INTEGER REFERENCES users(id),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at        TIMESTAMP
);

COMMENT ON TABLE transactions IS 'Tüm finansal işlem kayıtları';
COMMENT ON COLUMN transactions.transaction_ref IS 'Benzersiz dekont/referans numarası (TXN-XXXXXX)';
COMMENT ON COLUMN transactions.requires_approval IS 'true ise şube müdürü onayı bekleniyor';
COMMENT ON COLUMN transactions.status IS 'PENDING=onay bekliyor, APPROVED=onaylandı, REJECTED=reddedildi, COMPLETED=tamamlandı';

-- =====================================================
-- 7. AUDIT_LOGS — Sistem Denetim Logları
-- Güvenlik, hata ve bilgi kayıtları
-- =====================================================
CREATE TABLE audit_logs (
    id              SERIAL PRIMARY KEY,
    log_timestamp   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    level           VARCHAR(10) NOT NULL CHECK (level IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')),
    source          VARCHAR(100) NOT NULL,
    message         TEXT NOT NULL,
    user_id         INTEGER REFERENCES users(id),
    ip_address      VARCHAR(45),
    metadata        JSONB
);

COMMENT ON TABLE audit_logs IS 'Sistem genelindeki güvenlik ve operasyonel loglar';
COMMENT ON COLUMN audit_logs.metadata IS 'Ek detaylar JSON formatında (request body, hata detayı vb.)';

-- =====================================================
-- Tamamlandı! Tüm tablolar başarıyla oluşturuldu.
-- =====================================================
