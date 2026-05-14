import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-commission-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './commission-management.html',
  styleUrl: './commission-management.scss'
})
export class CommissionManagement {
  commissionRules = [
    { id: 1, type: 'EFT', role: 'CUSTOMER', rateOrAmount: '3.50', isPercentage: false, active: true },
    { id: 2, type: 'Havale', role: 'CUSTOMER', rateOrAmount: '0.00', isPercentage: false, active: true },
    { id: 3, type: 'Döviz Alış', role: 'CUSTOMER', rateOrAmount: '0.2', isPercentage: true, active: true },
    { id: 4, type: 'Kredi Kartı Nakit Avans', role: 'CUSTOMER', rateOrAmount: '1.5', isPercentage: true, active: true },
    { id: 5, type: 'EFT', role: 'VIP', rateOrAmount: '0.00', isPercentage: false, active: true }
  ];

  isModalOpen = false;
  editingRule: any = null;

  openModal(rule?: any) {
    if (rule) {
      this.editingRule = { ...rule };
    } else {
      this.editingRule = { type: '', role: 'CUSTOMER', rateOrAmount: '0', isPercentage: false, active: true };
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingRule = null;
  }

  saveRule() {
    if (this.editingRule.id) {
      const index = this.commissionRules.findIndex(r => r.id === this.editingRule.id);
      if (index !== -1) {
        this.commissionRules[index] = { ...this.editingRule };
      }
    } else {
      this.editingRule.id = Date.now();
      this.commissionRules.push({ ...this.editingRule });
    }
    this.closeModal();
  }

  toggleStatus(rule: any) {
    rule.active = !rule.active;
  }
}
