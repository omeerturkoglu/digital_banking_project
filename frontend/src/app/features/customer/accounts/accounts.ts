import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounts.html',
  styleUrl: './accounts.scss'
})
export class Accounts implements OnInit {
  myAccounts: any[] = [];

  // Yeni hesap form verileri
  newAccountType: string = 'TL'; // 'TL' veya 'DOVIZ'
  selectedCurrency: string = 'USD'; // USD, EUR, GBP
  isCreating: boolean = false;

  constructor(private cdr: ChangeDetectorRef, private http: HttpClient) {}

  ngOnInit() {
    this.fetchAccounts();
  }

  fetchAccounts() {
    const token = localStorage.getItem('nova_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any[]>('http://localhost:5000/api/v1/Accounts/my-wallets', { headers }).subscribe({
      next: (data) => {
        this.myAccounts = data.map(acc => {
          let symbol = '₺';
          let bg = 'from-emerald-500/20 to-brand-dark';
          let typeDesc = 'Vadesiz TL';
          
          if (acc.currency === 'USD') { symbol = '$'; bg = 'from-blue-500/20 to-brand-dark'; typeDesc = 'Vadesiz Döviz (USD)'; }
          else if (acc.currency === 'EUR') { symbol = '€'; bg = 'from-indigo-500/20 to-brand-dark'; typeDesc = 'Vadesiz Döviz (EUR)'; }
          
          return {
            ...acc,
            currencySymbol: symbol,
            bgClass: bg,
            typeDesc: typeDesc
          };
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  // Yeni Hesap Oluşturma Fonksiyonu
  openNewAccount() {
    alert("Yeni hesap açma özelliği Backend entegrasyonu tamamlandığında devreye girecektir.");
  }
}