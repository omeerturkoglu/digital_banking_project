import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard'; // <-- TİRE İŞARETİ İLE DÜZELTİLDİ

// Bileşenler
import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { Accounts } from './features/customer/accounts/accounts';
import { Transfers } from './features/customer/transfers/transfers';
import { CurrencyExchange } from './features/customer/currency-exchange/currency-exchange';
import { Reports } from './features/customer/reports/reports';
import { TransferApprovals } from './features/branch-manager/transfer-approvals/transfer-approvals';
import { CustomerOnboarding } from './features/teller/customer-onboarding/customer-onboarding';
import { SysLogs } from './features/admin/sys-logs/sys-logs';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },

  // MÜŞTERİ ROTALARI
  { 
    path: 'dashboard', 
    component: Dashboard, 
    canActivate: [authGuard], 
    data: { roles: ['CUSTOMER'] } 
  },
  { 
    path: 'accounts', 
    component: Accounts, 
    canActivate: [authGuard], 
    data: { roles: ['CUSTOMER'] } 
  },
  { 
    path: 'transfers', 
    component: Transfers, 
    canActivate: [authGuard], 
    data: { roles: ['CUSTOMER'] } 
  },
  { 
    path: 'exchange', 
    component: CurrencyExchange, 
    canActivate: [authGuard], 
    data: { roles: ['CUSTOMER'] } 
  },
  { 
    path: 'reports', 
    component: Reports, 
    canActivate: [authGuard], 
    data: { roles: ['CUSTOMER'] } 
  },

  // OPERASYONEL ROTALAR
  { 
    path: 'approvals', 
    component: TransferApprovals, 
    canActivate: [authGuard], 
    data: { roles: ['MANAGER'] }
  },
  { 
    path: 'onboarding', 
    component: CustomerOnboarding, 
    canActivate: [authGuard], 
    data: { roles: ['TELLER'] }
  },
  { 
    path: 'sys-logs', 
    component: SysLogs, 
    canActivate: [authGuard], 
    data: { roles: ['ADMIN'] }
  },

  // Hatalı Link Girilirse
  { path: '**', redirectTo: 'login' }
];