import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Burada giden isteği (req) dinliyoruz. İleride her isteğe otomatik JWT Token eklemek için de burayı kullanacağız.
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Backend'den gelen hataları havada yakalıyoruz
      if (error.status === 401) {
        alert('[GÜVENLİK İHLALİ] Oturumunuzun süresi doldu veya geçersiz token. Lütfen tekrar giriş yapın.');
        // Token'ları temizle ve Login'e at
        localStorage.removeItem('nova_user');
        localStorage.removeItem('nova_token');
        router.navigate(['/login']);
      } 
      else if (error.status === 403) {
        alert('[YETKİSİZ İŞLEM] Bu işlemi gerçekleştirmek için gerekli operasyonel izne sahip değilsiniz!');
      } 
      else if (error.status === 500) {
        alert('[SİSTEM HATASI] Merkezi sunucularda anlık bir iletişim problemi yaşanıyor. Lütfen kısa süre sonra tekrar deneyiniz.');
      } 
      else if (error.status === 0) {
         alert('[BAĞLANTI KOPTU] Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı veya VPN ayarlarınızı kontrol edin.');
      }

      // Hatayı konsola da basalım ki geliştirici (biz) görebilelim
      console.error('HTTP Interceptor Hatası Yakaladı:', error);
      
      return throwError(() => error);
    })
  );
};