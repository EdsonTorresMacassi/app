import { Routes } from '@angular/router';

export const COMPONENTS_ROUTES: Routes = [
  {
    path: 'select',
    loadComponent: () =>
      import('./select-docs-page/select-docs-page.component').then(
        (m) => m.SelectDocsPageComponent,
      ),
  },
  {
    path: 'input',
    loadComponent: () =>
      import('./input-docs-page/input-docs-page.component').then(
        (m) => m.InputDocsPageComponent,
      ),
  },
  {
    path: 'alert',
    loadComponent: () =>
      import('./alert-docs-page/alert-docs-page.component').then(
        (m) => m.AlertDocsPageComponent,
      ),
  },
  {
    path: 'button',
    loadComponent: () =>
      import('./button-docs-page/button-docs-page.component').then(
        (m) => m.ButtonDocsPageComponent,
      ),
  },
  {
    path: 'grid',
    loadComponent: () =>
      import('./grid-docs-page/grid-docs-page.component').then(
        (m) => m.GridDocsPageComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'input',
    pathMatch: 'full',
  },
];
