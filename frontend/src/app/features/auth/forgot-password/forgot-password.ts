import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  tcNo: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  
  isSubmitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient) {}

  get isTcNoValid(): boolean {
    return /^[0-9]{11}$/.test(this.tcNo);
  }

  get isFormValid(): boolean {
    return this.isTcNoValid && 
           this.currentPassword.length > 0 && 
           this.newPassword.length >= 6 && 
           this.newPassword === this.confirmPassword;
  }

  onTcInput(event: any) {
    const val = event.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    this.tcNo = val;
    event.target.value = val;
  }

  onSubmit() {
    if (!this.isFormValid) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const requestBody = {
      tckn: this.tcNo,
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    };

    console.log('[DEBUG-FORGOT] Istek gonderiliyor...', requestBody);

    this.http.post('http://localhost:5000/api/v1/Auth/reset-password', requestBody).subscribe({
      next: (res: any) => {
        console.log('[DEBUG-FORGOT] BASARI YANITI GELDI:', res);
        this.isSubmitting = false;
        this.successMessage = 'Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.';
        this.tcNo = '';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err) => {
        console.error('[DEBUG-FORGOT] HATA GELDI:', err);
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Şifre güncellenemedi. Lütfen bilgilerinizi kontrol edin.';
      }
    });
  }
}
