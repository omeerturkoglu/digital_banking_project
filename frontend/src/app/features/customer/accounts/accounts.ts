import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Input okumak için ekledik

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounts.html',
  styleUrl: './accounts.scss' // Sende css ise css yap
})
export class Accounts {
  // Mevcut hesaplar (Mock Veri)
  myAccounts = [
    { id: 1, type: 'Vadesiz TL', iban: 'TR12 0006 1111 2222 33', balance: 142500.00, currency: '₺', bg: 'from-emerald-500/20 to-brand-dark' },
    { id: 2, type: 'Vadesiz Döviz (USD)', iban: 'TR12 0006 7777 8888 99', balance: 4500.00, currency: '$', bg: 'from-blue-500/20 to-brand-dark' }
  ];

  // Yeni hesap form verileri
  newAccountType: string = 'TL'; // 'TL' veya 'DOVIZ'
  selectedCurrency: string = 'USD'; // USD, EUR, GBP
  isCreating: boolean = false;

  // Yeni Hesap Oluşturma Fonksiyonu
  openNewAccount() {
    this.isCreating = true;
    
    // API simülasyonu
    setTimeout(() => {
      this.isCreating = false;
      const newId = this.myAccounts.length + 1;
      const randomIban = 'TR12 0006 ' + Math.floor(1000 + Math.random() * 9000) + ' ' + Math.floor(1000 + Math.random() * 9000) + ' 00';
      
      if (this.newAccountType === 'TL') {
        // Yeni TL Hesabı Ekle
        this.myAccounts.push({ id: newId, type: 'Vadesiz TL', iban: randomIban, balance: 0, currency: '₺', bg: 'from-emerald-500/20 to-brand-dark' });
      } else {
        // Yeni Döviz Hesabı Ekle
        const symbol = this.selectedCurrency === 'USD' ? '$' : (this.selectedCurrency === 'EUR' ? '€' : '£');
        this.myAccounts.push({ id: newId, type: `Vadesiz Döviz (${this.selectedCurrency})`, iban: randomIban, balance: 0, currency: symbol, bg: 'from-blue-500/20 to-brand-dark' });
      }
    }, 800);
  }
}