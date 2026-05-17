import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-currency-exchange',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './currency-exchange.html',
  styleUrl: './currency-exchange.scss'
})
export class CurrencyExchange implements OnInit, OnDestroy {
  marketRates: any[] = [];
  myAccounts: any = {};
  myAccountList: any[] = [];

  selectedCurrency: any = null;
  transactionType: string = 'BUY'; 
  amount: number | null = null;
  isProcessing: boolean = false;
  private intervalId: any;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchLiveRates();
    this.fetchMyAccounts();
    
    // Refresh rates every 30 seconds
    this.intervalId = setInterval(() => {
      this.fetchLiveRates();
    }, 30000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  fetchLiveRates() {
    this.http.get<any>('http://localhost:5000/api/v1/Exchange/live-rates').subscribe({
      next: (data) => {
        // Since backend currently returns a dictionary { "USD": { buyRate, sellRate } ... }
        // We might need to transform it or update backend to return full objects.
        // For now, let's assume we update backend or handle dictionary.
        this.marketRates = Object.keys(data).map(key => ({
          code: key,
          name: this.getCurrencyName(key),
          buy: data[key].buyRate || data[key].BuyRate,
          sell: data[key].sellRate || data[key].SellRate,
          trend: 'stable'
        }));
        if (!this.selectedCurrency && this.marketRates.length > 0) {
          this.selectedCurrency = this.marketRates[0];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch live rates:', err);
      }
    });
  }

  getCurrencyName(code: string): string {
    const names: any = { 'USD': 'Amerikan Dolari', 'EUR': 'Euro', 'GBP': 'Ingiliz Sterlini', 'XAU': 'Gram Altin' };
    return names[code] || code;
  }

  fetchMyAccounts() {
    const token = localStorage.getItem('nova_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any[]>('http://localhost:5000/api/v1/Accounts/my-wallets', { headers }).subscribe({
      next: (data) => {
        this.myAccountList = data;
        this.myAccounts = {};
        data.forEach(acc => {
          this.myAccounts[acc.currency] = acc.balance;
        });
        this.cdr.detectChanges();
      }
    });
  }

  get calculatedTotal(): number {
    if (!this.amount || !this.selectedCurrency) return 0;
    return this.transactionType === 'BUY' 
      ? this.amount * this.selectedCurrency.sell 
      : this.amount * this.selectedCurrency.buy;
  }

  executeTrade() {
    if (!this.amount || this.amount <= 0) return alert('Gecerli bir tutar giriniz.');

    const total = this.calculatedTotal;
    const token = localStorage.getItem('nova_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.isProcessing = true;

    const requestBody = {
      fromCurrency: this.transactionType === 'BUY' ? 'TRY' : this.selectedCurrency.code,
      toCurrency: this.transactionType === 'BUY' ? this.selectedCurrency.code : 'TRY',
      amount: this.amount,
      operationType: this.transactionType
    };

    this.http.post('http://localhost:5000/api/v1/Exchange/execute', requestBody, { headers }).subscribe({
      next: (res: any) => {
        this.isProcessing = false;
        alert(`BASARILI: İşlem başarıyla gerçekleştirildi.`);
        this.amount = null;
        this.fetchMyAccounts();
      },
      error: (err) => {
        this.isProcessing = false;
        alert('HATA: ' + (err.error?.message || 'İşlem gerçekleştirilemedi.'));
      }
    });
  }
}