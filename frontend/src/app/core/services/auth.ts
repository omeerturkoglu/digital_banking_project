import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser: any = null;
  private apiUrl = 'http://localhost:5000/api/v1/Auth';

  constructor(private router: Router, private http: HttpClient) {
    this.restoreSessionFromToken();
  }

  login(tckn: string, password?: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { tckn, password }).pipe(
      tap(response => {
        this.handleLoginSuccess(response.token);
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  private handleLoginSuccess(token: string) {
    const payload = this.decodeToken(token);
    const fullName = payload?.unique_name || payload?.name || 'Kullanici';
    const roleCode = payload?.role || payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'CUSTOMER';

    let formattedName = fullName;
    let initials = 'U';

    if (fullName && fullName !== 'Kullanici') {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length > 1) {
        const lastName = parts.pop()?.toUpperCase() || '';
        const firstNames = parts.map((p: string) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');

        formattedName = `${firstNames} ${lastName}`;
        initials = (firstNames.charAt(0) + lastName.charAt(0)).toUpperCase();
      } else {
        formattedName = fullName.charAt(0).toUpperCase() + fullName.slice(1).toLowerCase();
        initials = formattedName.substring(0, 2).toUpperCase();
      }
    }

    const userProfile = {
      name: formattedName,
      role: this.mapRoleCodeToLabel(roleCode),
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

  private restoreSessionFromToken() {
    const token = localStorage.getItem('nova_token');
    if (!token) return;

    const payload = this.decodeToken(token);
    if (!payload) {
      localStorage.removeItem('nova_user');
      localStorage.removeItem('nova_token');
      this.currentUser = null;
      return;
    }

    const fullName = payload.unique_name || payload.name || 'Kullanici';
    const roleCode = payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'CUSTOMER';
    const parts = fullName.trim().split(/\s+/);
    const initials = parts.length > 1
      ? (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
      : fullName.substring(0, 2).toUpperCase();

    this.currentUser = {
      name: fullName,
      role: this.mapRoleCodeToLabel(roleCode),
      roleCode,
      initials
    };

    localStorage.setItem('nova_user', JSON.stringify(this.currentUser));
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Token decode edilemedi', e);
      return null;
    }
  }

  private mapRoleCodeToLabel(roleCode: string): string {
    if (roleCode === 'ADMIN') return 'Sistem Yöneticisi (Admin)';
    if (roleCode === 'MANAGER') return 'Şube Müdürü';
    if (roleCode === 'TELLER') return 'Gişe Memuru';
    return 'Müşteri (Kişisel Finans)';
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('nova_user');
    localStorage.removeItem('nova_token');
    this.router.navigate(['/login']);
  }

  hasRole(allowedRoles: string[]): boolean {
    if (!this.currentUser) return false;
    return allowedRoles.includes(this.currentUser.roleCode);
  }
}
