# Dijital Bankacılık Uygulaması (Digital Banking App)

Bu proje, Angular, .NET Core ve PostgreSQL kullanılarak geliştirilen bir modern bankacılık uygulamasıdır.

## 👥 Ekip ve Rol Dağılımı
- **Frontend:** Angular SPA - S. Koray Ölmez
- **Backend:** C# .NET Core RESTful API - İ. Emir Çınkır
- **Database & Cache:** PostgreSQL ve Redis - Ö. Türkoğlu

---

## 🛠️ Kurulum ve Geliştirme Ortamı Hazırlığı (Zorunlu)
Projeyi kendi bilgisayarınızda çalıştırabilmek için aşağıdaki yazılımların kurulu olması gerekmektedir:

1. **Docker Desktop:** Veritabanı (PostgreSQL) ve Önbellek (Redis) için.
   - [İndirme Linki](https://www.docker.com/products/docker-desktop/)
2. **Node.js (v20+):** Frontend uygulamasını çalıştırmak için.
   - [İndirme Linki](https://nodejs.org/)
3. **.NET 10 SDK:** Backend uygulamasını çalıştırmak ve derlemek için.
   - [İndirme Linki](https://dotnet.microsoft.com/download)
4. **Angular CLI:** Frontend geliştirmeleri için. (Terminalden `npm install -g @angular/cli` ile kurulabilir)

---

## 🚀 Projeyi Çalıştırma Adımları

### 1. Veritabanlarını Başlatma (Docker)
Proje ana dizininde aşağıdaki komutu çalıştırarak PostgreSQL ve Redis'i ayağa kaldırın:
```bash
docker-compose up -d
```

### 2. Backend'i Başlatma (.NET Core)
```bash
cd backend
dotnet run
```
API varsayılan olarak `http://localhost:5000` veya `https://localhost:5001` adresinde çalışacaktır.

### 3. Frontend'i Başlatma (Angular)
```bash
cd frontend
npm install   # Sadece ilk seferinde bağımlılıkları indirmek için
npm start
```
Uygulama `http://localhost:4200` adresinde çalışacaktır.
