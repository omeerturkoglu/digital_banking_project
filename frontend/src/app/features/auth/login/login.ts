import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth'; // AuthService'i ekledik

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  selectedRole: string = 'Müşteri (Kişisel Finans)'; // Varsayılan seçim
  tcNo: string = '';
  password: string = '';

  errorMessage: string = '';

  constructor(private authService: AuthService) {}

  onLogin() {
    console.log('[LOGIN] onLogin started', { tcNo: this.tcNo, role: this.selectedRole });
    this.errorMessage = '';
    if (!this.tcNo || !this.password) {
      this.errorMessage = 'Lütfen T.C. Kimlik numaranızı ve şifrenizi girin.';
      return;
    }

    this.authService.login(this.selectedRole, this.tcNo, this.password).subscribe({
      next: (res) => {
        console.log('[LOGIN] Login successful');
      },
      error: (err) => {
        console.error('[LOGIN] Login failed:', err);
        this.errorMessage = err.error?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
      }
    });
  }
}