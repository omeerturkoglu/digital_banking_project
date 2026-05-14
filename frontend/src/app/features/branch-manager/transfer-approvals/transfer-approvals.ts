import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transfer-approvals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transfer-approvals.html',
  styleUrl: './transfer-approvals.scss' // Sende .css ise uzantıyı değiştirmeyi unutma
})
export class TransferApprovals {
  // Emir'in API'sinden gelecek limit üstü transfer taleplerinin simülasyonu
  pendingTransfers = [
    { id: 'TRX-9823', customer: 'Ahmet Yılmaz', amount: 150000, currency: '₺', toIban: 'TR12 0006 0000 1111 2222 33', date: '14 Mayıs 10:30', risk: 'Düşük', riskColor: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'TRX-9825', customer: 'Mehmet Demir', amount: 450000, currency: '₺', toIban: 'TR98 0001 0000 4444 5555 66', date: '14 Mayıs 11:15', risk: 'Yüksek', riskColor: 'text-brand-accent', bg: 'bg-brand-accent/10' },
    { id: 'TRX-9830', customer: 'Ayşe Kaya', amount: 12000, currency: '$', toIban: 'US45 1234 5678 9012 3456 78', date: '14 Mayıs 12:45', risk: 'Orta', riskColor: 'text-amber-400', bg: 'bg-amber-500/10' }
  ];

  // Onaylama Fonksiyonu
  approveTransfer(id: string) {
    this.pendingTransfers = this.pendingTransfers.filter(t => t.id !== id);
    alert(`[SİSTEM MESAJI] ${id} numaralı transfer başarıyla ONAYLANDI.`);
    // Burada Emir'in onay Endpoint'ine HTTP Post atılacak
  }

  // Reddetme Fonksiyonu
  rejectTransfer(id: string) {
    this.pendingTransfers = this.pendingTransfers.filter(t => t.id !== id);
    alert(`[SİSTEM MESAJI] ${id} numaralı transfer REDDEDİLDİ. Müşteriye bilgi geçildi.`);
    // Burada Emir'in ret Endpoint'ine HTTP Post atılacak
  }
}