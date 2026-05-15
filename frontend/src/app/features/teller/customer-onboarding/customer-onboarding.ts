import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-customer-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule], // FormsModule'ü buraya dahil ettik
  templateUrl: './customer-onboarding.html',
  styleUrl: './customer-onboarding.scss'
})
export class CustomerOnboarding {
  // Form verilerini tutacağımız model
  customer = {
    tckn: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  };

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private http: HttpClient) {}

  get isTcNoValid(): boolean {
    return /^[0-9]{11}$/.test(this.customer.tckn);
  }

  get isEmailValid(): boolean {
    if (!this.customer.email) return true; // Opsiyonel olduğu için boşsa geçerli
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.customer.email);
  }

  get isPhoneValid(): boolean {
    return /^05[0-9]{9}$/.test(this.customer.phone);
  }

  get isFormValid(): boolean {
    return this.isTcNoValid && 
           this.customer.firstName.trim().length > 0 && 
           this.customer.lastName.trim().length > 0 && 
           this.isPhoneValid && 
           this.isEmailValid;
  }

  onTcInput(event: any) {
    const val = event.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    this.customer.tckn = val;
    event.target.value = val;
  }

  onPhoneInput(event: any) {
    const val = event.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    this.customer.phone = val;
    event.target.value = val;
  }

  // Kayıt İşlemi
  registerCustomer() {
    if (!this.isFormValid) return;

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const token = localStorage.getItem('nova_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    const requestBody = {
      tckn: this.customer.tckn,
      firstName: this.customer.firstName,
      lastName: this.customer.lastName,
      email: this.customer.email,
      phone: this.customer.phone,
      password: "Nova" + this.customer.tckn.substring(0, 4) // Geçici şifre
    };

    this.http.post('http://127.0.0.1:5000/api/v1/Teller/register-customer', requestBody, { headers }).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.successMessage = `Yeni müşteri kaydı başarıyla oluşturuldu. Geçici Şifre: ${requestBody.password}`;
        
        // Formu sıfırla
        this.customer = { tckn: '', firstName: '', lastName: '', phone: '', email: '' };
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Kayıt işlemi gerçekleştirilemedi.';
      }
    });
  }
}