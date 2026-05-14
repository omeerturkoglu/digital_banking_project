import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Mevcut giriş yapmış kullanıcıyı tutacağız
  currentUser: any = null;

  constructor(private router: Router) {
    // Sayfa yenilendiğinde LocalStorage'dan kullanıcıyı geri yükle
    const savedUser = localStorage.getItem('nova_user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  // Giriş Yapma Simülasyonu
  login(role: string, tckn: string) {
    // Seçilen role göre kullanıcı profili oluşturuyoruz
    let userProfile = {};

    switch(role) {
      case 'Müşteri (Kişisel Finans)':
        userProfile = { name: 'S. Koray Ölmez', role: 'Müşteri', roleCode: 'CUSTOMER', initials: 'SK' };
        break;
      case 'Sistem Yöneticisi (Admin)':
        userProfile = { name: 'İbrahim Emir Çınkır', role: 'Sistem Yöneticisi', roleCode: 'ADMIN', initials: 'İE' };
        break;
      case 'Şube Müdürü':
        userProfile = { name: 'Ömer Türkoğlu', role: 'Şube Müdürü', roleCode: 'MANAGER', initials: 'ÖT' };
        break;
      case 'Gişe Memuru':
        userProfile = { name: 'Gişe Personeli', role: 'Operasyon', roleCode: 'TELLER', initials: 'GP' };
        break;
    }

    // Kullanıcıyı sisteme ve tarayıcı hafızasına kaydet
    this.currentUser = userProfile;
    localStorage.setItem('nova_user', JSON.stringify(userProfile));
    
    // Geçici bir Token uydurup kaydedelim (İleride Emir'in API'sinden gelecek)
    localStorage.setItem('nova_token', 'eyJhbGciOiJIUzI1NiIsInR...');

    // Rolüne göre ana sayfaya yönlendir
    if (this.currentUser.roleCode === 'ADMIN') {
      this.router.navigate(['/sys-logs']);
    } else if (this.currentUser.roleCode === 'MANAGER') {
      this.router.navigate(['/approvals']);
    } else if (this.currentUser.roleCode === 'TELLER') {
      this.router.navigate(['/onboarding']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  // Çıkış Yapma
  logout() {
    this.currentUser = null;
    localStorage.removeItem('nova_user');
    localStorage.removeItem('nova_token');
    this.router.navigate(['/login']);
  }

  // Kullanıcının yetkisi var mı kontrolü (Menüleri gizlemek için kullanacağız)
  hasRole(allowedRoles: string[]): boolean {
    if (!this.currentUser) return false;
    return allowedRoles.includes(this.currentUser.roleCode);
  }
}