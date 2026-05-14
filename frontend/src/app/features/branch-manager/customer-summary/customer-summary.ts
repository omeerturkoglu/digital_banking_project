import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-summary.html',
  styleUrl: './customer-summary.scss'
})
export class CustomerSummary {
  customers = [
    { id: '1001', name: 'Ahmet Yılmaz', type: 'Bireysel', totalAssets: 145000, status: 'Aktif' },
    { id: '1002', name: 'Ayşe Demir', type: 'Kurumsal', totalAssets: 3200000, status: 'VIP' },
    { id: '1003', name: 'Canan Kaya', type: 'Bireysel', totalAssets: 45000, status: 'Aktif' },
    { id: '1004', name: 'TechSoft A.Ş.', type: 'Kurumsal', totalAssets: 8500000, status: 'VIP' },
    { id: '1005', name: 'Mehmet Öz', type: 'Bireysel', totalAssets: 12000, status: 'Pasif' }
  ];

  branchStats = {
    totalCustomers: 1254,
    totalAssets: 45000000,
    newCustomersThisMonth: 34
  };
}
