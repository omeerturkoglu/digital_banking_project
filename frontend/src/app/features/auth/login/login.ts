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
    this.errorMessage = '';
    if (!this.tcNo || !this.password) {
      this.errorMessage = 'Lütfen T.C. Kimlik numaranızı ve şifrenizi girin.';
      return;
    }

    this.authService.login(this.selectedRole, this.tcNo, this.password).subscribe({
      next: () => {
        // Yönlendirme serviste yapılıyor
      },
      error: (err) => {
        this.errorMessage = 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
        console.error(err);
      }
    });
  }
}