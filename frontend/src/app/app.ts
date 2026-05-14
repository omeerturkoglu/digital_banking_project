import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common'; // *ngIf kullanabilmek için ekledik
import { Sidebar } from './shared/sidebar/sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Sidebar, CommonModule], // CommonModule'ü buraya da ekledik
  templateUrl: './app.html',
  styleUrl: './app.scss' 
})
export class App {
  title = 'frontend';
  showLayout = true; // Varsayılan olarak menüleri göster

  constructor(private router: Router) {
    // Kullanıcının sayfa geçişlerini (URL'yi) anlık olarak dinliyoruz
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Eğer link '/login' ise veya ana dizin '/' ise menüyü SAKLA (false)
        this.showLayout = !(event.url === '/login' || event.url === '/' || event.url === '/forgot-password');
      }
    });
  }
}