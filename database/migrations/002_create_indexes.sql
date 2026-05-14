-- =====================================================
-- NOVA BANK — Performans Index'leri
-- Migration: 002_create_indexes.sql
-- Tarih: 2026-05-14
-- Yazar: Ömer Türkoğlu
-- =====================================================

-- USERS index'leri
CREATE INDEX idx_users_tckn ON users(tckn);
CREATE INDEX idx_users_role_code ON users(role_code);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ACCOUNTS index'leri
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_iban ON accounts(iban);
CREATE INDEX idx_accounts_currency ON accounts(currency);
CREATE INDEX idx_accounts_user_active ON accounts(user_id, is_active);

-- TRANSACTIONS index'leri (en kritik tablo — çok sorgulanacak)
CREATE INDEX idx_transactions_from_account ON transactions(from_account_id);
CREATE INDEX idx_transactions_to_account ON transactions(to_account_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_ref ON transactions(transaction_ref);
-- Şube müdürü onay bekleyenler için bileşik index
CREATE INDEX idx_transactions_pending_approval ON transactions(status, requires_approval) 
    WHERE status = 'PENDING' AND requires_approval = true;
-- Aylık rapor sorgusu için (tarih + hesap bazlı)
CREATE INDEX idx_transactions_account_date ON transactions(from_account_id, created_at DESC);

-- EXCHANGE_RATES index'leri
CREATE INDEX idx_exchange_rates_code ON exchange_rates(currency_code);
CREATE INDEX idx_exchange_rates_updated ON exchange_rates(updated_at DESC);

-- BUDGET_CATEGORIES index'leri
CREATE INDEX idx_budget_categories_user ON budget_categories(user_id);

-- AUDIT_LOGS index'leri
CREATE INDEX idx_audit_logs_level ON audit_logs(level);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(log_timestamp DESC);
CREATE INDEX idx_audit_logs_source ON audit_logs(source);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
-- Admin panelinde filtreleme için bileşik index
CREATE INDEX idx_audit_logs_level_time ON audit_logs(level, log_timestamp DESC);

-- =====================================================
-- Tamamlandı! Tüm index'ler oluşturuldu.
-- =====================================================
