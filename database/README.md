# 🗄️ NOVA BANK — Veritabanı Dokümantasyonu

> Bu doküman backend geliştiricisi (**İ. Emir Çınkır**) için hazırlanmıştır.
> Hazırlayan: **Ö. Türkoğlu** — Veritabanı Yöneticisi ve Sistem Analisti
> Son Güncelleme: 14 Mayıs 2026
>
> Veritabanı: **PostgreSQL 15** | Cache: **Redis 7** | Toplam Tablo: **11**

---

## 🔌 Bağlantı Bilgileri

### PostgreSQL
```
Host:     localhost
Port:     5432
Database: banking_db
Username: banking_user
Password: banking_password
```

**Connection String (appsettings.json için):**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=banking_db;Username=banking_user;Password=banking_password",
    "Redis": "localhost:6379"
  }
}
```

### Redis
```
Host: localhost
Port: 6379
Password: (yok — şifresiz)
```

### Docker Başlatma
```bash
docker-compose up -d
```

---

## 📋 Tablo Yapıları (11 Tablo)

### 1. `users` — Kullanıcılar
| Kolon | Tip | Constraint | Açıklama |
|-------|-----|-----------|----------|
| id | SERIAL | PK | Otomatik artan |
| tckn | VARCHAR(11) | UNIQUE, NOT NULL | TC Kimlik No |
| first_name | VARCHAR(100) | NOT NULL | Ad |
| last_name | VARCHAR(100) | NOT NULL | Soyad |
| email | VARCHAR(255) | — | E-posta |
| phone | VARCHAR(15) | — | Telefon |
| password_hash | VARCHAR(255) | NOT NULL | BCrypt hash |
| role_code | VARCHAR(20) | NOT NULL, CHECK | CUSTOMER / ADMIN / MANAGER / TELLER |
| **branch_id** | **INTEGER** | **FK → branches(id)** | **Kullanıcının bağlı olduğu şube** |
| is_active | BOOLEAN | DEFAULT true | Hesap aktif mi |
| created_at | TIMESTAMP | DEFAULT now() | Kayıt tarihi |
| updated_at | TIMESTAMP | DEFAULT now() | Güncelleme tarihi |

### 2. `branches` — Banka Şubeleri *(YENİ)*
| Kolon | Tip | Constraint | Açıklama |
|-------|-----|-----------|----------|
| id | SERIAL | PK | |
| branch_code | VARCHAR(10) | UNIQUE, NOT NULL | Şube kodu (IST-001) |
| branch_name | VARCHAR(100) | NOT NULL | Şube adı |
| city | VARCHAR(50) | NOT NULL | Şehir |
| address | VARCHAR(255) | — | Adres |
| is_active | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMP | DEFAULT now() | |

### 3. `accounts` — Banka Hesapları
| Kolon | Tip | Constraint | Açıklama |
|-------|-----|-----------|----------|
| id | SERIAL | PK | |
| user_id | INTEGER | FK → users(id), CASCADE | Hesap sahibi |
| account_type | VARCHAR(20) | CHECK | VADESIZ_TL / VADESIZ_DOVIZ |
| currency | VARCHAR(3) | CHECK | TRY / USD / EUR / GBP |
| **account_number** | **VARCHAR(20)** | **UNIQUE** | **Benzersiz hesap numarası (NVB-xxxx)** |
| iban | VARCHAR(34) | UNIQUE, NOT NULL | IBAN numarası |
| balance | DECIMAL(18,2) | CHECK >= 0 | Bakiye (negatif olamaz) |
| is_active | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMP | DEFAULT now() | |

### 4. `transactions` — İşlem Geçmişi
| Kolon | Tip | Constraint | Açıklama |
|-------|-----|-----------|----------|
| id | SERIAL | PK | |
| transaction_ref | VARCHAR(20) | UNIQUE, NOT NULL | Dekont no (TXN-XXXXXX) |
| from_account_id | INTEGER | FK → accounts(id) | Gönderen hesap |
| to_account_id | INTEGER | FK → accounts(id) | Alıcı hesap (iç transfer) |
| to_iban | VARCHAR(34) | — | Harici IBAN (dış banka) |
| amount | DECIMAL(18,2) | CHECK > 0 | İşlem tutarı |
| currency | VARCHAR(3) | NOT NULL | Para birimi |
| transaction_type | VARCHAR(20) | CHECK | **HAVALE / EFT / DOVIZ_ALIM / DOVIZ_SATIM / NAKIT_YATIRMA / NAKIT_CEKME** |
| transaction_fee | DECIMAL(18,2) | DEFAULT 0 | Komisyon |
| exchange_rate | DECIMAL(10,4) | — | Döviz kuru (varsa) |
| status | VARCHAR(20) | CHECK | PENDING / APPROVED / REJECTED / COMPLETED |
| category | VARCHAR(50) | — | Harcama kategorisi |
| merchant_name | VARCHAR(255) | — | İşlem yeri |
| description | VARCHAR(500) | — | Açıklama |
| requires_approval | BOOLEAN | DEFAULT false | Müdür onayı gerekiyor mu |
| approved_by | INTEGER | FK → users(id) | Onaylayan müdür |
| created_at | TIMESTAMP | DEFAULT now() | |
| completed_at | TIMESTAMP | — | Tamamlanma zamanı |

### 5. `transfer_limits` — Transfer Kuralları
| Kolon | Tip | Constraint | Açıklama |
|-------|-----|-----------|----------|
| id | SERIAL | PK | |
| currency | VARCHAR(3) | CHECK | Para birimi |
| max_amount | DECIMAL(18,2) | NOT NULL | Üstü → müdür onayı |
| fee_type | VARCHAR(20) | CHECK | HAVALE / EFT |
| fee_amount | DECIMAL(18,2) | DEFAULT 0 | Komisyon tutarı |
| is_active | BOOLEAN | DEFAULT true | |

### 6. `commission_rules` — Komisyon Yönetimi *(YENİ)*
| Kolon | Tip | Constraint | Açıklama |
|-------|-----|-----------|----------|
| id | SERIAL | PK | |
| rule_name | VARCHAR(100) | NOT NULL | Kural adı (EFT Komisyonu vb.) |
| transaction_type | VARCHAR(20) | NOT NULL | HAVALE / EFT / DOVIZ_ALIM / DOVIZ_SATIM |
| currency | VARCHAR(3) | DEFAULT 'TRY' | Para birimi |
| fixed_amount | DECIMAL(18,2) | DEFAULT 0 | Sabit tutar (12.50 TL gibi) |
| percentage_rate | DECIMAL(5,4) | DEFAULT 0 | Yüzdelik oran (0.0015 = binde 1.5) |
| min_amount | DECIMAL(18,2) | DEFAULT 0 | Bu tutarın üstüne uygulanır |
| is_active | BOOLEAN | DEFAULT true | |
| updated_by | INTEGER | FK → users(id) | Son güncelleyen admin |
| created_at | TIMESTAMP | DEFAULT now() | |
| updated_at | TIMESTAMP | DEFAULT now() | |

### 7. `exchange_rates` — Anlık Döviz Kurları
| Kolon | Tip | Constraint | Açıklama |
|-------|-----|-----------|----------|
| id | SERIAL | PK | |
| currency_code | VARCHAR(3) | UNIQUE | USD / EUR / GBP / XAU |
| currency_name | VARCHAR(100) | NOT NULL | Tam ad |
| buy_rate | DECIMAL(10,4) | NOT NULL | Bankanın alış kuru |
| sell_rate | DECIMAL(10,4) | NOT NULL | Bankanın satış kuru |
| trend | VARCHAR(10) | CHECK | up / down / stable |
| source | VARCHAR(50) | DEFAULT 'MANUAL' | TCMB / MANUAL |
| updated_at | TIMESTAMP | DEFAULT now() | |

### 8. `exchange_rate_history` — Döviz Kur Geçmişi *(YENİ)*
| Kolon | Tip | Constraint | Açıklama |
|-------|-----|-----------|----------|
| id | SERIAL | PK | |
| currency_code | VARCHAR(3) | NOT NULL | Döviz kodu |
| buy_rate | DECIMAL(10,4) | NOT NULL | O anki alış kuru |
| sell_rate | DECIMAL(10,4) | NOT NULL | O anki satış kuru |
| source | VARCHAR(50) | DEFAULT 'TCMB' | Kaynak |
| recorded_at | TIMESTAMP | DEFAULT now() | Kaydedilme zamanı |

> **Not:** Background job her çalıştığında `exchange_rates` tablosunu günceller ve eski değeri `exchange_rate_history`'ye yazar. Böylece kur geçmişi korunur.

### 9. `budget_categories` — Bütçe Kategorileri
| Kolon | Tip | Constraint | Açıklama |
|-------|-----|-----------|----------|
| id | SERIAL | PK | |
| user_id | INTEGER | FK → users(id), CASCADE | |
| category_name | VARCHAR(50) | NOT NULL | Kategori adı |
| monthly_limit | DECIMAL(18,2) | — | Aylık bütçe limiti |
| **yearly_limit** | **DECIMAL(18,2)** | — | **Yıllık bütçe limiti** |
| **period** | **VARCHAR(10)** | **CHECK** | **MONTHLY / YEARLY** |
| color_code | VARCHAR(20) | — | UI renk kodu |
| created_at | TIMESTAMP | DEFAULT now() | |

### 10. `password_reset_tokens` — Şifre Sıfırlama *(YENİ)*
| Kolon | Tip | Constraint | Açıklama |
|-------|-----|-----------|----------|
| id | SERIAL | PK | |
| user_id | INTEGER | FK → users(id), CASCADE | Token'ın ait olduğu kullanıcı |
| token | VARCHAR(255) | UNIQUE, NOT NULL | Benzersiz sıfırlama token'ı |
| expires_at | TIMESTAMP | NOT NULL | Token geçerlilik süresi |
| is_used | BOOLEAN | DEFAULT false | Kullanıldı mı |
| created_at | TIMESTAMP | DEFAULT now() | |

### 11. `audit_logs` — Sistem Logları
| Kolon | Tip | Constraint | Açıklama |
|-------|-----|-----------|----------|
| id | SERIAL | PK | |
| log_timestamp | TIMESTAMP | DEFAULT now() | |
| level | VARCHAR(10) | CHECK | INFO / WARNING / ERROR / CRITICAL |
| source | VARCHAR(100) | NOT NULL | Kaynak servis adı |
| message | TEXT | NOT NULL | Log mesajı |
| user_id | INTEGER | FK → users(id) | İlgili kullanıcı |
| ip_address | VARCHAR(45) | — | İstek IP adresi |
| metadata | JSONB | — | Ek detaylar (JSON) |

---

## 🔗 Tablo İlişkileri

```
branches ──1:N──→ users ──1:N──→ accounts ──1:N──→ transactions
                    │                                    │
                    ├──1:N──→ budget_categories           ├── approved_by → users
                    ├──1:N──→ audit_logs                  └── exchange_rate → exchange_rates
                    └──1:N──→ password_reset_tokens
                    
commission_rules ← admin tarafından yönetilir
exchange_rate_history ← background job tarafından doldurulur
```

---

## 🔑 Test Kullanıcıları

| Rol | Ad Soyad | TCKN | Şifre | Şube |
|-----|----------|------|-------|------|
| CUSTOMER | S. Koray Ölmez | 12345678901 | password123 | Çorlu Şubesi |
| ADMIN | İbrahim Emir Çınkır | 98765432101 | password123 | — (Genel) |
| MANAGER | Ömer Türkoğlu | 11223344556 | password123 | Çorlu Şubesi |
| TELLER | Ayşe Yıldız | 55443322110 | password123 | Çorlu Şubesi |

> Şifreler BCrypt hash'i olarak saklanır. Backend'de `BCrypt.Net-Next` paketi ile doğrulama yapılmalıdır.

### Şubeler

| Kod | Ad | Şehir |
|-----|----|-------|
| IST-001 | Çorlu Şubesi | Tekirdağ |
| IST-002 | Çerkezköy Şubesi | Tekirdağ |
| ANK-001 | Ankara Merkez Şube | Ankara |

---

## 🔴 Redis Anahtar Yapısı

| Anahtar | Değer | TTL | Kullanım |
|---------|-------|-----|----------|
| `rates:live` | JSON (tüm kurlar) | 60s | Döviz kur cache |
| `session:{userId}` | JWT + kullanıcı bilgisi | 30dk | Oturum yönetimi |
| `dashboard:{userId}` | Özet istatistikler | 5dk | Dashboard cache |
| `reports:{userId}:{month}` | Aylık rapor verisi | 15dk | Rapor cache |
| `ratelimit:transfer:{userId}` | İşlem sayacı | 1 saat | Flood koruması |
| `login:failed:{ip}` | Hatalı giriş sayısı | 15dk | Brute-force koruması |

### Redis Kullanım Akışı (Backend'de uygulanacak)
```
İstek gelir → Redis'te var mı? 
                ├── EVET → Direkt döndür (~1ms)
                └── HAYIR → PostgreSQL'den çek → Redis'e yaz (TTL ile) → Döndür
```

---

## 📁 SQL Dosyaları ve Çalıştırma Sırası

Migration ve seed dosyaları **aşağıdaki sırayla** çalıştırılmalıdır:

```powershell
# 1. Temel tabloları oluştur (7 tablo)
Get-Content database\migrations\001_create_tables.sql | docker exec -i banking_postgres psql -U banking_user -d banking_db

# 2. Performans index'lerini oluştur (23 index)
Get-Content database\migrations\002_create_indexes.sql | docker exec -i banking_postgres psql -U banking_user -d banking_db

# 3. Rapor uyumluluk güncellemesi (4 yeni tablo + 3 güncelleme + 13 index)
Get-Content database\migrations\003_rapor_uyumluluk.sql | docker exec -i banking_postgres psql -U banking_user -d banking_db

# 4. Temel test verilerini ekle
Get-Content database\seeds\001_seed_data.sql | docker exec -i banking_postgres psql -U banking_user -d banking_db

# 5. Rapor uyumluluk test verilerini ekle
Get-Content database\seeds\002_rapor_uyumluluk_seed.sql | docker exec -i banking_postgres psql -U banking_user -d banking_db
```

> **Not:** Bu komutlar sıfırdan kurulum içindir. Eğer veritabanı zaten kuruluysa tekrar çalıştırmana gerek yok.

---

## 🛠️ Backend İçin Gerekli NuGet Paketleri

```bash
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package StackExchange.Redis
dotnet add package BCrypt.Net-Next
```

---

## 📌 Frontend'ten Beklenen API Endpoint'leri

Frontend'teki `api.ts` dosyasında şu endpoint'ler zaten tanımlı:

| Metot | Endpoint | İlgili Tablo(lar) |
|-------|----------|-------------------|
| GET | `/api/v1/accounts/my-wallets` | accounts |
| POST | `/api/v1/transfers/new` | transactions, accounts |
| GET | `/api/v1/exchange/live-rates` | exchange_rates (Redis cache) |
| GET | `/api/v1/manager/pending-transfers` | transactions (status=PENDING) |

Henüz frontend'de tanımlanmamış ama eklenmesi gereken:

| Metot | Endpoint | İlgili Tablo(lar) |
|-------|----------|-------------------|
| POST | `/api/v1/auth/login` | users |
| POST | `/api/v1/auth/register` | users, accounts |
| POST | `/api/v1/auth/reset-password` | password_reset_tokens |
| GET | `/api/v1/reports/monthly-summary` | transactions, budget_categories |
| GET | `/api/v1/admin/logs` | audit_logs |
| GET | `/api/v1/admin/commission-rules` | commission_rules |
| PUT | `/api/v1/admin/commission-rules/{id}` | commission_rules |
| POST | `/api/v1/manager/approve/{id}` | transactions |
| POST | `/api/v1/manager/reject/{id}` | transactions |
| GET | `/api/v1/manager/branch-summary` | users, accounts, branches |
| POST | `/api/v1/teller/cash-deposit` | transactions, accounts |
| POST | `/api/v1/teller/cash-withdraw` | transactions, accounts |
