import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  user = {
    tckn: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  };

  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  onRegister() {
    console.log('[REGISTER] onRegister started', this.user);
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.user.tckn || !this.user.password || !this.user.firstName || !this.user.lastName) {
      this.errorMessage = 'Lütfen zorunlu alanları doldurun.';
      return;
    }

    this.isLoading = true;
    console.log('[REGISTER] Calling authService.register...');
    this.authService.register(this.user).subscribe({
      next: (res) => {
        console.log('[REGISTER] Response received (next):', res);
        this.isLoading = false;
        this.successMessage = 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...';
        this.cdr.detectChanges();
        setTimeout(() => {
          console.log('[REGISTER] Navigating to /login');
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('[REGISTER] Response received (error):', err);
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Kayıt sırasında bir hata oluştu.';
        this.cdr.detectChanges();
      }
    });
  }
}
