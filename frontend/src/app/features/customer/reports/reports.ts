import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './reports.html',
  styleUrl: './reports.scss'
})
export class Reports {
  // Pasta Grafik Tipi ve Verileri
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Market & Gıda', 'Faturalar', 'Eğlence', 'Ulaşım', 'Eğitim'],
    datasets: [{
      data: [4500, 2200, 3150, 1500, 1500],
      backgroundColor: ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6'],
      borderWidth: 0,
      hoverOffset: 10
    }]
  };

  // Modern Grafik Ayarları (Legend kapalı, İnce Halka, Şık Tooltip)
  public doughnutChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      // Çirkin varsayılan legend'ı kapattık (Yerine HTML'de kendimiz çizdik)
      legend: { display: false }, 
      // Üzerine gelince çıkan bilgi kutucuğunu (tooltip) şıklaştırır
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true
      }
    },
    cutout: '82%', // Halkanın içini daha çok boşaltıp zarif bir çizgi haline getirdik
    layout: {
      padding: 10 // Grafiğin etrafına nefes aldıracak boşluk
    }
  };

  // Bütçe Hedefleri Verisi
  budgets = [
    { category: 'Market & Gıda', limit: 5000, spent: 4500, color: 'bg-emerald-500' },
    { category: 'Eğlence', limit: 4000, spent: 3150, color: 'bg-blue-500' },
    { category: 'Faturalar', limit: 2500, spent: 2200, color: 'bg-rose-500' }
  ];

  // Son İşlemler (Kategorize Edilecek Liste)
  transactions = [
    { id: 'TX-101', merchant: 'Migros A.Ş.', amount: 1250.50, date: '14 Mayıs', category: 'Market & Gıda' },
    { id: 'TX-102', merchant: 'Netflix', amount: 229.99, date: '12 Mayıs', category: 'Eğlence' },
    { id: 'TX-103', merchant: 'CK Boğaziçi Elektrik', amount: 845.00, date: '10 Mayıs', category: 'Faturalar' },
    { id: 'TX-104', merchant: 'Belirsiz İşlem (POS)', amount: 450.00, date: '09 Mayıs', category: 'Kategorisiz' }
  ];

  // Bütçe Yüzde Hesaplayıcı
  getPercentage(spent: number, limit: number): number {
    return Math.min(Math.round((spent / limit) * 100), 100);
  }

  // İşlem Kategorisi Güncelleme
  updateCategory(tx: any, newCategory: string) {
    tx.category = newCategory;
    alert(`[Sistem Mesajı] ${tx.merchant} işlemi '${newCategory}' olarak güncellendi.`);
  }

  // Bütçe Formu Modal State ve Metotları
  isBudgetModalOpen = false;
  editingBudget: any = null;

  openBudgetModal(budget?: any) {
    if (budget) {
      this.editingBudget = { ...budget };
    } else {
      this.editingBudget = { category: '', limit: 0, spent: 0, color: 'bg-emerald-500' };
    }
    this.isBudgetModalOpen = true;
  }

  closeBudgetModal() {
    this.isBudgetModalOpen = false;
    this.editingBudget = null;
  }

  saveBudget() {
    if (!this.editingBudget.category || this.editingBudget.limit <= 0) return;
    
    const existingIndex = this.budgets.findIndex(b => b.category === this.editingBudget.category);
    if (existingIndex !== -1) {
      this.budgets[existingIndex].limit = this.editingBudget.limit;
    } else {
      this.budgets.push({ ...this.editingBudget });
    }
    this.closeBudgetModal();
  }
}