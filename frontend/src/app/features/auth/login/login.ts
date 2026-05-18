import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  tcNo: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService) {}

  onLogin() {
    console.log('[LOGIN] onLogin started', { tcNo: this.tcNo });
    this.errorMessage = '';

    if (!this.tcNo || !this.password) {
      this.errorMessage = 'Lutfen T.C. Kimlik numaranizi ve sifrenizi girin.';
      return;
    }

    this.authService.login(this.tcNo, this.password).subscribe({
      next: () => {
        console.log('[LOGIN] Login successful');
      },
      error: (err) => {
        console.error('[LOGIN] Login failed:', err);
        this.errorMessage = err.error?.message || 'Giris basarisiz. Lutfen bilgilerinizi kontrol edin.';
      }
    });
  }
}
