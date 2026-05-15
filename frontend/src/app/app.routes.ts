import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard'; // <-- TİRE İŞARETİ İLE DÜZELTİLDİ

import { Register } from './features/auth/register/register';
import { RouterModule } from '@angular/router';

// Bileşenler
import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { Accounts } from './features/customer/accounts/accounts';
import { Transfers } from './features/customer/transfers/transfers';
import { CurrencyExchange } from './features/customer/currency-exchange/currency-exchange';
import { Reports } from './features/customer/reports/reports';
import { TransferApprovals } from './features/branch-manager/transfer-approvals/transfer-approvals';
import { CustomerSummary } from './features/branch-manager/customer-summary/customer-summary';
import { CustomerApprovals } from './features/branch-manager/customer-approvals/customer-approvals';
import { CustomerOnboarding } from './features/teller/customer-onboarding/customer-onboarding';
import { CashOperations } from './features/teller/cash-operations/cash-operations';
import { SysLogs } from './features/admin/sys-logs/sys-logs';
import { FinancialReport } from './features/admin/financial-report/financial-report';
import { CommissionManagement } from './features/admin/commission-management/commission-management';
import { ForgotPassword } from './features/auth/forgot-password/forgot-password';
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },

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
    path: 'customer-summary', 
    component: CustomerSummary, 
    canActivate: [authGuard], 
    data: { roles: ['MANAGER'] }
  },
  { 
    path: 'customer-approvals', 
    component: CustomerApprovals, 
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
    path: 'cash-operations', 
    component: CashOperations, 
    canActivate: [authGuard], 
    data: { roles: ['TELLER'] }
  },
  { 
    path: 'sys-logs', 
    component: SysLogs, 
    canActivate: [authGuard], 
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'financial-report', 
    component: FinancialReport, 
    canActivate: [authGuard], 
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'commission-management', 
    component: CommissionManagement, 
    canActivate: [authGuard], 
    data: { roles: ['ADMIN'] }
  },

  // Hatalı Link Girilirse
  { path: '**', redirectTo: 'login' }
];