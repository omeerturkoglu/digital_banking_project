import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser: any = null;
  private apiUrl = 'http://localhost:5000/api/v1/Auth';

  constructor(private router: Router, private http: HttpClient) {
    const savedUser = localStorage.getItem('nova_user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  login(role: string, tckn: string, password?: string) {
    if (role === 'Müşteri (Kişisel Finans)') {
      return this.http.post<any>(`${this.apiUrl}/login`, { tckn, password }).pipe(
        tap(response => {
          this.handleLoginSuccess(response.token, tckn, role, 'CUSTOMER');
        })
      );
    } else {
      // Diğer roller için şimdilik mock devam edebilir veya backend'e bağlanabilir
      let roleCode = 'CUSTOMER';
      if (role === 'Sistem Yöneticisi (Admin)') roleCode = 'ADMIN';
      else if (role === 'Şube Müdürü') roleCode = 'MANAGER';
      else if (role === 'Gişe Memuru') roleCode = 'TELLER';
      
      return this.http.post<any>(`${this.apiUrl}/login`, { tckn, password }).pipe(
        tap(response => {
          this.handleLoginSuccess(response.token, tckn, role, roleCode);
        })
      );
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  private handleLoginSuccess(token: string, tckn: string, roleName: string, roleCode: string) {
    let fullName = 'Kullanıcı';
    try {
      // JWT token'ın payload kısmını çöz (Base64Url Decode)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      
      // .NET ClaimTypes.Name genellikle "unique_name" veya "name" olarak serialize edilir
      fullName = payload.unique_name || payload.name || 'Kullanıcı';
    } catch (e) {
      console.error('Token decode edilemedi', e);
    }

    // Formatlama: İsmin İlk Harfleri Büyük, Soyisim TAMAMEN BÜYÜK
    let formattedName = fullName;
    let initials = 'U';

    if (fullName && fullName !== 'Kullanıcı') {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length > 1) {
        const lastName = parts.pop()?.toUpperCase() || '';
        const firstNames = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
        
        formattedName = `${firstNames} ${lastName}`;
        initials = (firstNames.charAt(0) + lastName.charAt(0)).toUpperCase();
      } else {
        formattedName = fullName.charAt(0).toUpperCase() + fullName.slice(1).toLowerCase();
        initials = formattedName.substring(0, 2).toUpperCase();
      }
    }

    const userProfile = { 
      name: formattedName, 
      role: roleName, 
      roleCode: roleCode, 
      initials: initials 
    };
    
    this.currentUser = userProfile;
    localStorage.setItem('nova_user', JSON.stringify(userProfile));
    localStorage.setItem('nova_token', token);

    if (roleCode === 'ADMIN') this.router.navigate(['/sys-logs']);
    else if (roleCode === 'MANAGER') this.router.navigate(['/approvals']);
    else if (roleCode === 'TELLER') this.router.navigate(['/onboarding']);
    else this.router.navigate(['/dashboard']);
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