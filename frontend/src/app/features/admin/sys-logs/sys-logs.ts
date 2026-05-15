import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-sys-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sys-logs.html',
  styleUrl: './sys-logs.scss'
})
export class SysLogs implements OnInit {
  logs: any[] = [
    { time: '--:--:--', level: 'INFO', source: 'UI', msg: 'Loglar backend sunucusundan çekiliyor...', status: 'text-gray-500' }
  ];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Component yüklendiğinde hemen alert vererek JS çalışıyor mu görelim
    // alert('SysLogs Component Başlatıldı. API isteği atılıyor...');
    this.fetchLogs();
  }

  fetchLogs() {
    const token = localStorage.getItem('nova_token');
    
    if (!token) {
      this.logs = [{ time: '--:--:--', level: 'ERROR', source: 'Auth', msg: 'Token bulunamadı!', status: 'text-red-500' }];
      this.cdr.detectChanges();
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any[]>('http://localhost:5000/api/v1/Admin/logs', { headers }).subscribe({
      next: (data) => {
        // alert('Backendden cevap geldi! Kayıt sayısı: ' + (data ? data.length : 0));
        try {
          if (!Array.isArray(data)) {
            this.logs = [{ time: '--:--:--', level: 'ERROR', source: 'API', msg: 'Format hatası.', status: 'text-red-500' }];
            this.cdr.detectChanges();
            return;
          }

          if (data.length === 0) {
            this.logs = [{ time: '--:--:--', level: 'INFO', source: 'API', msg: 'Veritabanında log yok.', status: 'text-brand-primary' }];
            this.cdr.detectChanges();
            return;
          }

          data.sort((a, b) => new Date(b.logTimestamp).getTime() - new Date(a.logTimestamp).getTime());
          
          this.logs = data.map(log => {
            let statusColor = 'text-gray-400';
            if (log.level === 'CRITICAL') statusColor = 'text-red-500';
            else if (log.level === 'WARNING') statusColor = 'text-amber-500';
            else if (log.level === 'ERROR') statusColor = 'text-brand-accent';
            else if (log.level === 'INFO') statusColor = 'text-brand-primary';

            const date = new Date(log.logTimestamp || new Date());
            const timeString = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            return {
              time: timeString,
              level: log.level || 'UNKNOWN',
              source: log.source || 'Unknown',
              msg: log.message || 'No message',
              status: statusColor
            };
          });
          
          this.cdr.detectChanges();
        } catch (e: any) {
          this.logs = [{ time: '--:--:--', level: 'ERROR', source: 'UI', msg: 'Hata: ' + e.message, status: 'text-red-500' }];
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        alert('API ISTEGI PATLADI! Status: ' + err.status);
        this.logs = [{ time: '--:--:--', level: 'ERROR', source: 'Network', msg: 'Hata: ' + err.status, status: 'text-red-500' }];
        this.cdr.detectChanges();
      }
    });
  }
}