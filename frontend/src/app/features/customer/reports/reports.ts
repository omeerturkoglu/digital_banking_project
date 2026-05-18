import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss'
})
export class Reports implements OnInit {
  transactions: any[] = [];
  totalTransactions = 0;
  pendingTransactions = 0;
  completedTransactions = 0;
  isLoading = false;
  errorMessage = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchTransactions();
  }

  fetchTransactions() {
    const token = localStorage.getItem('nova_token');
    if (!token) {
      this.errorMessage = 'Oturum bulunamadi.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.get<any[]>('http://localhost:5000/api/v1/Accounts/my-transactions', { headers }).subscribe({
      next: (data) => {
        const normalized = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.value)
            ? (data as any).value
            : [];

        this.transactions = normalized;
        this.totalTransactions = normalized.length;
        this.pendingTransactions = normalized.filter((t: any) => t.status === 'PENDING').length;
        this.completedTransactions = normalized.filter((t: any) => t.status === 'COMPLETED').length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Hesap hareketleri yuklenemedi.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getDirectionLabel(direction: string): string {
    if (direction === 'OUT') return 'Giden';
    if (direction === 'IN') return 'Gelen';
    if (direction === 'EXCHANGE') return 'Doviz';
    if (direction === 'INTERNAL') return 'Ic Transfer';
    return 'Bilgi';
  }

  getDirectionClass(direction: string): string {
    if (direction === 'OUT') return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
    if (direction === 'IN') return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
    if (direction === 'EXCHANGE') return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
    return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
  }

  getStatusClass(status: string): string {
    if (status === 'COMPLETED') return 'text-emerald-300';
    if (status === 'PENDING') return 'text-amber-300';
    if (status === 'REJECTED') return 'text-rose-300';
    return 'text-slate-300';
  }

  formatAmount(tx: any): string {
    const sign = tx.direction === 'OUT' ? '-' : tx.direction === 'IN' ? '+' : '';
    return `${sign}${Number(tx.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${tx.currency}`;
  }

  formatFee(value: number): string {
    return Number(value).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString('tr-TR');
  }
}
