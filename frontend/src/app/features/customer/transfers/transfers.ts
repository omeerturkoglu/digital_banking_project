import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Input değerlerini okumak için

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transfers.html',
  styleUrl: './transfers.scss'
})
export class Transfers {
  // Simüle edilmiş müşteri hesapları
  accounts = [
    { id: 1, name: 'Vadesiz Maaş', balance: 142500.00, currency: '₺', iban: 'TR12 0006 1111 2222 33', type: 'TL' },
    { id: 2, name: 'Birikim Hesabı', balance: 25000.00, currency: '₺', iban: 'TR12 0006 4444 5555 66', type: 'TL' },
    { id: 3, name: 'Döviz Yatırım', balance: 4500.00, currency: '$', iban: 'TR12 0006 7777 8888 99', type: 'USD' }
  ];

  selectedAccount = this.accounts[0];
  toIban: string = '';
  amount: number | null = null;
  transferType: string = 'havale'; // 'havale' veya 'eft'
  isProcessing: boolean = false;

  // Transfer tipine göre dinamik komisyon hesaplama (Rapordaki Yönetici kuralı simülasyonu)
  get transactionFee(): number {
    return this.transferType === 'eft' ? 12.50 : 0.00;
  }

  // Toplam çıkış
  get totalAmount(): number {
    return (this.amount || 0) + this.transactionFee;
  }

  // Transferi Başlat
  executeTransfer() {
    if (!this.toIban || !this.amount || this.amount <= 0) {
      alert('Lütfen geçerli bir IBAN ve tutar giriniz.');
      return;
    }

    if (this.totalAmount > this.selectedAccount.balance) {
      alert('HATA: Yetersiz bakiye! İşlem ücretini de göz önünde bulundurun.');
      return;
    }

    this.isProcessing = true;

    // API İstek Simülasyonu
    setTimeout(() => {
      this.isProcessing = false;
      
      // Bakiye düşme simülasyonu
      this.selectedAccount.balance -= this.totalAmount;
      
      alert(`BAŞARILI: ${this.amount} ${this.selectedAccount.currency} transfer edildi.\nDekont numarası: TXN-${Math.floor(Math.random() * 1000000)}`);
      
      // Formu temizle
      this.toIban = '';
      this.amount = null;
    }, 1200);
  }
}