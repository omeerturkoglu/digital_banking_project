import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-customer-approvals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-approvals.html',
  styleUrl: './customer-approvals.scss'
})
export class CustomerApprovals implements OnInit {
  pendingUsers: any[] = [];
  loading = true;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchPendingUsers();
  }

  fetchPendingUsers() {
    const token = localStorage.getItem('nova_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any[]>('http://localhost:5000/api/v1/Manager/pending-users', { headers }).subscribe({
      next: (data) => {
        this.pendingUsers = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert('Kullanıcılar getirilirken hata: ' + err.status);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  approveUser(id: number) {
    if (!confirm('Bu müşteriyi onaylamak istediğinize emin misiniz?')) return;
    
    const token = localStorage.getItem('nova_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.post(`http://localhost:5000/api/v1/Manager/approve-user/${id}`, {}, { headers }).subscribe({
      next: (res: any) => {
        alert('Müşteri başarıyla onaylandı!');
        this.fetchPendingUsers();
      },
      error: (err) => {
        alert('Onaylama sırasında hata: ' + err.status);
      }
    });
  }
}
