import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  setTab(tab: 'deposit' | 'withdraw') {
    this.activeTab = tab;
    this.successMessage = null;
  }

  processTransaction() {
    if (!this.accountNo || !this.amount) return;

    this.isProcessing = true;
    this.successMessage = null;

    // Simulating API call
    setTimeout(() => {
      this.isProcessing = false;
      this.successMessage = this.activeTab === 'deposit' 
        ? 'Nakit yatırma işlemi başarıyla tamamlandı.' 
        : 'Nakit çekme işlemi başarıyla tamamlandı.';
      
      // Reset form
      this.accountNo = '';
      this.amount = null;
      this.description = '';
    }, 1500);
  }
}
