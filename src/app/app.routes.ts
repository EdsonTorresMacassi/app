import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'profile/complete',
        title: 'Completar Perfil | Sistema',
        loadComponent: () =>
          import('./features/profile/complete-profile.component')
            .then(m => m.CompleteProfileComponent)
      },
      {
        path: 'dashboard',
        title: 'Dashboard | Sistema',
        loadComponent: () =>
          import('./features/dashboard/analytics/analytics-report.component')
            .then(m => m.AnalyticsReportComponent)
      },
      {
        path: 'reports/analytics',
        title: 'Analítica | Sistema',
        canActivate: [permissionGuard],
        data: { permission: 'REPORT_VIEW' },
        loadComponent: () =>
          import('./features/dashboard/analytics/analytics-report.component')
            .then(m => m.AnalyticsReportComponent)
      },
      {
        path: 'admin/users',
        title: 'Gestión de Usuarios | Sistema',
        canActivate: [permissionGuard],
        data: { permission: 'USER_READ' },
        loadComponent: () =>
          import('./features/admin/user-management/user-list.component')
            .then(m => m.UserListComponent)
      },
      {
        path: 'admin/roles',
        title: 'Roles y Permisos | Sistema',
        canActivate: [permissionGuard],
        data: { permission: 'ROLE_READ' },
        loadComponent: () =>
          import('./features/admin/role-management/role-list.component')
            .then(m => m.RoleListComponent)
      },
      {
        path: 'forbidden',
        title: '403 Acceso Denegado | Sistema',
        loadComponent: () =>
          import('./features/errors/forbidden/forbidden.component')
            .then(m => m.ForbiddenComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
