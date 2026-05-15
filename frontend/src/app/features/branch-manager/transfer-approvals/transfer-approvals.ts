import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-transfer-approvals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transfer-approvals.html',
  styleUrl: './transfer-approvals.scss' 
})
export class TransferApprovals implements OnInit {
  pendingTransfers: any[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchPendingTransfers();
  }

  fetchPendingTransfers() {
    const token = localStorage.getItem('nova_token');
    if (!token) return;

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any[]>('http://localhost:5000/api/v1/Manager/pending-transfers', { headers }).subscribe({
      next: (data) => {
        this.pendingTransfers = data.map(t => {
           let symbol = '₺';
           if (t.currency === 'USD') symbol = '$';
           else if (t.currency === 'EUR') symbol = '€';
           
           let risk = 'Dusuk';
           let riskColor = 'text-emerald-400';
           let bg = 'bg-emerald-500/10';
           
           if (t.amount > 500000) { risk = 'Yuksek'; riskColor = 'text-brand-accent'; bg = 'bg-brand-accent/10'; }
           else if (t.amount > 250000) { risk = 'Orta'; riskColor = 'text-amber-400'; bg = 'bg-amber-500/10'; }

           return { ...t, currencySymbol: symbol, risk, riskColor, bg };
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  approveTransfer(id: number, ref: string) {
    const token = localStorage.getItem('nova_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    this.http.post(`http://localhost:5000/api/v1/Manager/approve/${id}`, {}, { headers }).subscribe({
      next: () => {
        alert(`[SISTEM MESAJI] ${ref} numarali transfer basariyla ONAYLANDI.`);
        this.fetchPendingTransfers();
      },
      error: (err) => alert('Onaylanirken hata olustu.')
    });
  }

  rejectTransfer(id: number, ref: string) {
    const token = localStorage.getItem('nova_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    this.http.post(`http://localhost:5000/api/v1/Manager/reject/${id}`, {}, { headers }).subscribe({
      next: () => {
        alert(`[SISTEM MESAJI] ${ref} numarali transfer REDDEDILDI. Musteriye bilgi gecildi.`);
        this.fetchPendingTransfers();
      },
      error: (err) => alert('Reddedilirken hata olustu.')
    });
  }
}