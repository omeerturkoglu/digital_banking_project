# 🏦 Dijital Bankacılık Uygulaması (Digital Banking System)

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Angular](https://img.shields.io/badge/Angular-v18+-red?logo=angular)
![.NET](https://img.shields.io/badge/.NET-v10-blueviolet?logo=dotnet)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16-blue?logo=postgresql)

Bu proje, modern bankacılık ihtiyaçlarını karşılamak üzere tasarlanmış, çok katmanlı (N-Tier) mimariye sahip kapsamlı bir dijital bankacılık çözümüdür. SPA (Single Page Application) yaklaşımıyla geliştirilen frontend ve RESTful API mimarisiyle güçlendirilen backend bileşenlerinden oluşur.

---

## 🌟 Öne Çıkan Özellikler

Uygulama, farklı kullanıcı rolleri (Müşteri, Gişe Memuru, Şube Müdürü ve Sistem Yöneticisi) için özelleştirilmiş deneyimler sunar:

### 👤 Müşteri Paneli
- **Hesap Yönetimi:** Vadesiz, vadeli ve döviz hesaplarının görüntülenmesi ve açılması.
- **Para Transferleri:** Havale/EFT işlemleri, IBAN ile transfer.
- **Döviz İşlemleri:** Anlık kurlar üzerinden döviz alım-satım işlemleri.
- **PFM (Kişisel Finans Yönetimi):** Harcama analizleri ve finansal grafikler.

### 🏢 Banka Operasyonları
- **Gişe Memuru (Teller):** Müşteri adına para yatırma/çekme ve temel bankacılık işlemleri.
- **Şube Müdürü (Manager):** Şube bazlı raporlamalar, personel ve müşteri limit yönetimi.
- **Sistem Yöneticisi (Admin):** Kullanıcı rolleri, sistem ayarları ve genel denetim.

---

## 🛠️ Teknoloji Yığını

### **Frontend**
- **Angular 18+**: Modern ve performanslı SPA deneyimi.
- **RxJS**: Reaktif veri akışı yönetimi.
- **SASS/SCSS**: Esnek ve modüler stil yönetimi.

### **Backend**
- **.NET 10**: En güncel, yüksek performanslı backend motoru.
- **Entity Framework Core**: Veritabanı yönetim katmanı.
- **Redis**: Hızlı önbellekleme ve oturum yönetimi.

### **Veritabanı & Altyapı**
- **PostgreSQL**: İlişkisel veri yönetimi.
- **Docker**: Konteynerize edilmiş veritabanı ve servis altyapısı.

---

## 🚀 Başlarken

### Gereksinimler
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js (v20+)](https://nodejs.org/)
- [.NET 10 SDK](https://dotnet.microsoft.com/download)

### Kurulum Adımları

1. **Altyapıyı Başlatın:**
   ```bash
   docker-compose up -d
   ```

2. **Backend'i Çalıştırın:**
   ```bash
   cd backend
   dotnet run
   ```

3. **Frontend'i Çalıştırın:**
   ```bash
   cd frontend
   npm install
   npm start
   ```
---

## 👥 Ekip ve Rol Dağılımı

- **S. Koray Ölmez** - *Frontend Architect*
- **İ. Emir Çınkır** - *Backend Lead*
- **Ö. Türkoğlu** - *Database & Infrastructure Specialist*

---

## 🔑 Test Kullanıcıları

Sunum sırasında aşağıdaki kullanıcıları kullanabilirsiniz:

| Rol | TCKN | Şifre |
| :--- | :--- | :--- |
| **Müşteri** | `12345678901` | `password123` |
| **Sistem Yöneticisi** | `98765432101` | `password123` |
| **Şube Müdürü** | `11223344556` | `password123` |
| **Gişe Memuru** | `55443322110` | `password123` |

---

© 2026 Dijital Bankacılık Projesi. Tüm Hakları Saklıdır.
