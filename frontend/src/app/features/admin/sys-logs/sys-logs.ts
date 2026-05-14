import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // *ngFor kullanabilmek için ekledik

@Component({
  selector: 'app-sys-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sys-logs.html',
  styleUrl: './sys-logs.scss' // Sende .css ise düzeltmeyi unutma
})
export class SysLogs {
  // Simüle edilmiş sistem ve güvenlik logları
  logs = [
    { time: '14:23:05', level: 'CRITICAL', source: 'Auth Service', msg: 'Çoklu hatalı giriş denemesi tespit edildi. (IP: 192.168.1.45 - Rol: Şube Müdürü)', status: 'text-red-500' },
    { time: '14:21:12', level: 'WARNING', source: 'Transfer API', msg: 'Limit üstü şüpheli transfer! Şube müdürü onayı bekleniyor. (Tutar: 250.000 TL)', status: 'text-amber-500' },
    { time: '14:15:00', level: 'INFO', source: 'DB Sync', msg: 'PostgreSQL ve Redis önbellek senkronizasyonu başarıyla tamamlandı.', status: 'text-brand-primary' },
    { time: '14:10:22', level: 'INFO', source: 'Kur Servisi', msg: 'TCMB API üzerinden güncel döviz kurları sisteme çekildi.', status: 'text-brand-primary' },
    { time: '13:55:10', level: 'ERROR', source: 'Payment Gateway', msg: 'Dış banka EFT doğrulama servisinde zaman aşımı (Timeout) oluştu.', status: 'text-brand-accent' },
    { time: '13:30:00', level: 'INFO', source: 'System', msg: 'Sistem Yöneticisi giriş yaptı. Oturum başlatıldı.', status: 'text-gray-400' },
  ];
}