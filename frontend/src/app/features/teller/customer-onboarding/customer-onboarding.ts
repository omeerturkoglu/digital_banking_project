import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Form işlemleri için ekledik

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

  // Kayıt İşlemi
  registerCustomer() {
    if(!this.customer.tckn || !this.customer.firstName || !this.customer.lastName) {
      alert("Lütfen zorunlu alanları doldurun!");
      return;
    }

    this.isSubmitting = true;

    // API'ye istek atıyormuşuz gibi 1.5 saniyelik bir gecikme simülasyonu
    setTimeout(() => {
      this.isSubmitting = false;
      this.successMessage = `Başarılı! ${this.customer.firstName} ${this.customer.lastName} sisteme eklendi. Vadesiz TL hesabı (TR12 0006...) açıldı ve geçici şifre SMS ile ${this.customer.phone} numarasına iletildi.`;
      
      // Formu sıfırla
      this.customer = { tckn: '', firstName: '', lastName: '', phone: '', email: '' };
    }, 1500);
  }
}