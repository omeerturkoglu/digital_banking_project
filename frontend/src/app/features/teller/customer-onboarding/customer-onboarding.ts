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

    // API'ye istek atıyormuşuz gibi 1.5 saniyelik bir gecikme simülasyonu
    setTimeout(() => {
      this.isSubmitting = false;
      this.successMessage = `Başarılı! ${this.customer.firstName} ${this.customer.lastName} sisteme eklendi. Vadesiz TL hesabı (TR12 0006...) açıldı ve geçici şifre SMS ile ${this.customer.phone} numarasına iletildi.`;
      
      // Formu sıfırla
      this.customer = { tckn: '', firstName: '', lastName: '', phone: '', email: '' };
    }, 1500);
  }
}