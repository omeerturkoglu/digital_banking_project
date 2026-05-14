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

  constructor(private authService: AuthService) {}

  onLogin() {
    // Servis üzerinden giriş işlemini başlatıyoruz
    this.authService.login(this.selectedRole, '12345678901');
  }
}