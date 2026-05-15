import { Component } from '@angular/core';
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

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.user.tckn || !this.user.password || !this.user.firstName || !this.user.lastName) {
      this.errorMessage = 'Lütfen zorunlu alanları doldurun.';
      return;
    }

    this.isLoading = true;
    this.authService.register(this.user).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Kayıt sırasında bir hata oluştu.';
        console.error(err);
      }
    });
  }
}
