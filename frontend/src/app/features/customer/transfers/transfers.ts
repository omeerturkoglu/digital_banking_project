import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transfers.html',
  styleUrl: './transfers.scss'
})
export class Transfers implements OnInit {
  accounts: any[] = [];
  selectedAccount: any = null;
  toIban: string = '';
  amount: number | null = null;
  transferType: string = 'HAVALE'; // 'HAVALE' veya 'EFT'
  isProcessing: boolean = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchAccounts();
  }

  fetchAccounts() {
    const token = localStorage.getItem('nova_token');
    if (!token) return;

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any[]>('http://localhost:5000/api/v1/Accounts/my-wallets', { headers }).subscribe({
      next: (data) => {
        this.accounts = (data || []).map(acc => {
           let symbol = '₺';
           if (acc.currency === 'USD') symbol = '$';
           else if (acc.currency === 'EUR') symbol = '€';
           return { ...acc, currencySymbol: symbol, name: acc.accountType.replace('_', ' ') };
        });
        
        if (this.accounts.length > 0 && !this.selectedAccount) {
          this.selectedAccount = this.accounts[0];
        } else if (this.selectedAccount) {
          // Bakiye güncellendiğinde selectedAccount'u da güncelle
          this.selectedAccount = this.accounts.find(a => a.id === this.selectedAccount.id) || this.accounts[0];
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Hesaplar çekilemedi:', err)
    });
  }

  // Transfer tipine göre dinamik komisyon hesaplama
  get transactionFee(): number {
    return this.transferType === 'EFT' ? 12.50 : 0.00;
  }

  // Toplam çıkış
  get totalAmount(): number {
    return (this.amount || 0) + this.transactionFee;
  }

  // Transferi Başlat
  executeTransfer() {
    if (!this.selectedAccount) {
      alert('Lütfen geçerli bir hesap seçiniz.');
      return;
    }
    if (!this.toIban || !this.amount || this.amount <= 0) {
      alert('Lütfen geçerli bir IBAN ve tutar giriniz.');
      return;
    }

    if (this.totalAmount > this.selectedAccount.balance) {
      alert('HATA: Yetersiz bakiye! İşlem ücretini de göz önünde bulundurun.');
      return;
    }

    this.isProcessing = true;

    // Frontend IBAN kutusunda TR span'ı var, kullanıcı sadece rakamları giriyor
    // Dolayısıyla backend'e gönderirken başına TR ekliyoruz ve boşlukları siliyoruz
    let formattedIban = this.toIban.replace(/\s+/g, '');
    if (!formattedIban.startsWith('TR')) {
      formattedIban = 'TR' + formattedIban;
    }

    const payload = {
      fromAccountId: this.selectedAccount.id,
      toIban: formattedIban,
      amount: this.amount,
      transactionType: this.transferType,
      description: 'Transfer İşlemi'
    };

    const token = localStorage.getItem('nova_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.post('http://localhost:5000/api/v1/Transfers/new', payload, { headers }).subscribe({
      next: (res: any) => {
        this.isProcessing = false;
        alert(res.message || 'İşlem alındı.');
        this.fetchAccounts(); // Bakiyeyi güncellemek için
        this.toIban = '';
        this.amount = null;
      },
      error: (err) => {
        this.isProcessing = false;
        alert('HATA: ' + (err.error?.message || err.message || 'Transfer gerçekleştirilemedi.'));
        this.cdr.detectChanges();
      }
    });
  }
}