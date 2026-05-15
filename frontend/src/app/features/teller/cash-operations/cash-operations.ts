import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-cash-operations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cash-operations.html',
  styleUrl: './cash-operations.scss'
})
export class CashOperations {
  activeTab: 'deposit' | 'withdraw' = 'deposit';
  
  accountNo: string = '';
  amount: number | null = null;
  description: string = '';

  isProcessing: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private http: HttpClient) {}

  setTab(tab: 'deposit' | 'withdraw') {
    this.activeTab = tab;
    this.successMessage = null;
  }

  processTransaction() {
    if (!this.accountNo || !this.amount) return;

    this.isProcessing = true;
    this.successMessage = null;
    this.errorMessage = null;

    const token = localStorage.getItem('nova_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    const endpoint = this.activeTab === 'deposit' ? 'deposit' : 'withdraw';
    const requestBody = {
      iban: this.accountNo,
      amount: this.amount,
      description: this.description
    };

    this.http.post(`http://127.0.0.1:5000/api/v1/Teller/${endpoint}`, requestBody, { headers }).subscribe({
      next: (res: any) => {
        this.isProcessing = false;
        this.successMessage = res.message;
        
        // Reset form
        this.accountNo = '';
        this.amount = null;
        this.description = '';
      },
      error: (err) => {
        this.isProcessing = false;
        this.errorMessage = err.error?.message || 'İşlem gerçekleştirilemedi.';
      }
    });
  }
}
