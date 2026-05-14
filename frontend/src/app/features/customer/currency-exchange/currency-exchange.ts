import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-currency-exchange',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './currency-exchange.html',
  styleUrl: './currency-exchange.scss'
})
export class CurrencyExchange implements OnInit, OnDestroy {
  // Canlı piyasa kurları (Simülasyon)
  marketRates = [
    { code: 'USD', name: 'Amerikan Doları', buy: 32.45, sell: 32.65, trend: 'up' },
    { code: 'EUR', name: 'Euro', buy: 35.10, sell: 35.40, trend: 'up' },
    { code: 'GBP', name: 'İngiliz Sterlini', buy: 40.85, sell: 41.25, trend: 'down' },
    { code: 'XAU', name: 'Gram Altın', buy: 2450.50, sell: 2475.00, trend: 'up' }
  ];

  // Kullanıcının mevcut hesapları
  myAccounts = {
    TRY: 142500.00,
    USD: 4500.00,
    EUR: 0.00
  };

  selectedCurrency = this.marketRates[0];
  transactionType: string = 'BUY'; // 'BUY' (Döviz Al) veya 'SELL' (Döviz Sat)
  amount: number | null = null;
  isProcessing: boolean = false;
  private intervalId: any;

  // Canlı kur dalgalanması simülasyonu
  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.marketRates.forEach(rate => {
        const change = (Math.random() * 0.04) - 0.02; // -0.02 ile +0.02 arası değişim
        rate.buy = +(rate.buy + change).toFixed(2);
        rate.sell = +(rate.sell + change).toFixed(2);
        rate.trend = change >= 0 ? 'up' : 'down';
      });
    }, 3000); // Her 3 saniyede bir kurlar titreşir
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  // İşlem Tutarı Hesaplama
  get calculatedTotal(): number {
    if (!this.amount) return 0;
    return this.transactionType === 'BUY' 
      ? this.amount * this.selectedCurrency.sell // Banka satar, müşteri alır
      : this.amount * this.selectedCurrency.buy; // Banka alır, müşteri satar
  }

  // İşlemi Gerçekleştir
  executeTrade() {
    if (!this.amount || this.amount <= 0) return alert('Geçerli bir tutar giriniz.');

    const total = this.calculatedTotal;

    if (this.transactionType === 'BUY' && total > this.myAccounts.TRY) {
      return alert('HATA: Bu işlem için yeterli TL bakiyeniz bulunmuyor.');
    }
    
    if (this.transactionType === 'SELL') {
       const availableDoviz = this.selectedCurrency.code === 'USD' ? this.myAccounts.USD : this.myAccounts.EUR;
       if (this.amount > availableDoviz) return alert(`HATA: Yeterli ${this.selectedCurrency.code} bakiyeniz yok.`);
    }

    this.isProcessing = true;

    // API Simülasyonu
    setTimeout(() => {
      this.isProcessing = false;
      
      if (this.transactionType === 'BUY') {
        this.myAccounts.TRY -= total;
        if(this.selectedCurrency.code === 'USD') this.myAccounts.USD += this.amount!;
        if(this.selectedCurrency.code === 'EUR') this.myAccounts.EUR += this.amount!;
      } else {
        this.myAccounts.TRY += total;
        if(this.selectedCurrency.code === 'USD') this.myAccounts.USD -= this.amount!;
        if(this.selectedCurrency.code === 'EUR') this.myAccounts.EUR -= this.amount!;
      }

      alert(`BAŞARILI: ${this.amount} ${this.selectedCurrency.code} işlemi başarıyla gerçekleştirildi.\nYeni TL Bakiyeniz: ₺${this.myAccounts.TRY.toFixed(2)}`);
      this.amount = null;
    }, 1000);
  }
}