import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BaseChartDirective, CommonModule], 
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss' 
})
export class Dashboard implements OnInit {
  
  totalBalance: number = 0;
  totalIncome: number = 0;
  totalExpense: number = 0;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchMyWallets();
  }

  fetchMyWallets() {
    const token = localStorage.getItem('nova_token');
    if (!token) return;

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any[]>('http://localhost:5000/api/v1/Accounts/my-wallets', { headers }).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.totalBalance = data.reduce((sum, acc) => sum + acc.balance, 0);
        } else {
          this.totalBalance = 0;
        }

        // Mock grafikleri sıfırla ki gerçekçi olsun (ileride API'ye bağlanacak)
        this.lineChartData.datasets[0].data = [0, 0, 0, 0, 0, 0];
        this.lineChartData.datasets[1].data = [0, 0, 0, 0, 0, 0];
        this.doughnutChartData.datasets[0].data = [0, 0, 0, 0, 0];

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Bakiye çekilirken hata:', err)
    });
  }

  // 1. Çizgi Grafik Ayarları (Gelir/Gider)
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartData<'line'> = {
    labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'], // Alt kısımdaki aylar
    datasets: [
      {
        data: [28000, 32000, 30000, 35000, 34200, 0],
        label: 'Gelir',
        borderColor: '#10b981', // Zümrüt Yeşili
        backgroundColor: 'rgba(16, 185, 129, 0.1)', // Hafif yeşil dolgu
        fill: true,
        tension: 0.4 // Çizgilerin yumuşak, oval dönmesini sağlar
      },
      {
        data: [15000, 18000, 14000, 19000, 12850, 0],
        label: 'Gider',
        borderColor: '#f43f5e', // Mercan Kırmızısı
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#f8fafc' } } // Açıklama renkleri
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } }
    }
  };

  // 2. Pasta Grafik Ayarları (Harcama Kategorileri)
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Market & Gıda', 'Faturalar', 'Eğlence', 'Eğitim', 'Diğer'],
    datasets: [
      {
        data: [4500, 2200, 3150, 1500, 1500],
        // Özgün FinTech renk paletimiz
        backgroundColor: ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6'],
        borderWidth: 0,
        hoverOffset: 6
      }
    ]
  };
  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#f8fafc' } }
    }
  };
}