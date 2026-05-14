import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Emir'in C# API'sini çalıştıracağı varsayılan lokal adres
  private baseUrl = 'http://localhost:5000/api/v1'; 

  constructor(private http: HttpClient) {}

  // Genel Headers (JWT Token eklenecek yer)
  private getHeaders() {
    const token = localStorage.getItem('nova_token'); // İleride Login olunca buraya token gelecek
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // 1. Müşteri Hesaplarını Çekme (GET İsteği)
  getMyAccounts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/accounts/my-wallets`, { headers: this.getHeaders() });
  }

  // 2. Para Transferi Yapma (POST İsteği)
  executeTransfer(transferData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/transfers/new`, transferData, { headers: this.getHeaders() });
  }

  // 3. Canlı Kurları Çekme (GET İsteği)
  getExchangeRates(): Observable<any> {
    return this.http.get(`${this.baseUrl}/exchange/live-rates`, { headers: this.getHeaders() });
  }

  // 4. Müdür Onay Bekleyen İşlemleri Çekme (GET İsteği)
  getPendingApprovals(): Observable<any> {
    return this.http.get(`${this.baseUrl}/manager/pending-transfers`, { headers: this.getHeaders() });
  }
}