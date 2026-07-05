import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

/**
 * Estrategia de preloading: solo precarga las rutas admin más visitadas.
 * Las rutas de errores y completar perfil no se precargan (raramente usadas).
 * Esto mejora el Time-to-Interactive inicial sin descargar todos los chunks.
 */
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
        // Sin data.preload — no se precarga (ruta de primer login)
      },
      {
        path: 'waiting-room',
        title: 'Cuenta en Revisión | Sistema',
        loadComponent: () =>
          import('./features/auth/waiting-room/waiting-room.component')
            .then(m => m.WaitingRoomComponent)
      },
      {
        path: 'dashboard',
        title: 'Dashboard | Sistema',
        data: { preload: true },
        loadComponent: () =>
          import('./features/dashboard/analytics/analytics-report.component')
            .then(m => m.AnalyticsReportComponent)
      },
      {
        path: 'reports/analytics',
        title: 'Analítica | Sistema',
        canActivate: [permissionGuard],
        data: { permission: 'REPORT_VIEW', preload: true },
        loadComponent: () =>
          import('./features/dashboard/analytics/analytics-report.component')
            .then(m => m.AnalyticsReportComponent)
      },
      {
        path: 'admin/users',
        title: 'Gestión de Usuarios | Sistema',
        canActivate: [permissionGuard],
        data: { permission: 'USER_READ', preload: true },
        loadComponent: () =>
          import('./features/admin/user-management/user-list.component')
            .then(m => m.UserListComponent)
      },
      {
        path: 'admin/roles',
        title: 'Roles y Permisos | Sistema',
        canActivate: [permissionGuard],
        data: { permission: 'ROLE_READ', preload: true },
        loadComponent: () =>
          import('./features/admin/role-management/role-list.component')
            .then(m => m.RoleListComponent)
      },
      {
        path: 'admin/catalogs',
        title: 'Gestión de Catálogos | Sistema',
        canActivate: [permissionGuard],
        data: { permission: 'CATALOG_READ', preload: true },
        loadComponent: () =>
          import('./features/admin/catalog-management/catalog-management.component')
            .then(m => m.CatalogManagementComponent)
      },
      {
        path: 'forbidden',
        title: '403 Acceso Denegado | Sistema',
        // Sin data.preload — no se precarga (ruta de error)
        loadComponent: () =>
          import('./features/errors/forbidden/forbidden.component')
            .then(m => m.ForbiddenComponent)
      },
      {
        path: 'components',
        title: 'Design System | Sistema',
        loadChildren: () =>
          import('./features/components/components.routes').then(
            (m) => m.COMPONENTS_ROUTES
          ),
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
