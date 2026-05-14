import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth'; 

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Kullanıcı hiç giriş yapmamışsa
  if (!authService.currentUser) {
    alert('[GÜVENLİK İHLALİ] Sisteme giriş yapmadan bu sayfaya erişemezsiniz!');
    router.navigate(['/login']);
    return false;
  }

  // 2. Rota için özel bir rol izni tanımlanmış mı kontrol et
  const expectedRoles = route.data['roles'] as Array<string>;
  
  if (expectedRoles) {
    const hasAccess = authService.hasRole(expectedRoles);
    if (!hasAccess) {
      alert('[YETKİSİZ ERİŞİM] Bu sayfayı görüntülemek için yeterli yetkiniz bulunmuyor.');
      router.navigate(['/dashboard']); 
      return false;
    }
  }

  return true;
};