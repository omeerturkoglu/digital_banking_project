import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-financial-report',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './financial-report.html',
  styleUrl: './financial-report.scss'
})
export class FinancialReport {
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: ['Havale', 'EFT', 'Döviz Alış', 'Döviz Satış', 'Fatura Ödeme'],
    datasets: [
      {
        data: [150000, 250000, 80000, 95000, 45000],
        label: 'İşlem Hacmi (₺)',
        backgroundColor: '#10b981',
        borderRadius: 4
      }
    ]
  };
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#f8fafc' } }
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } }
    }
  };

  public systemStats = {
    totalRevenue: 12500000,
    commissionIncome: 450000,
    activeUsers: 8500,
    dailyTransactions: 1250
  };
}
