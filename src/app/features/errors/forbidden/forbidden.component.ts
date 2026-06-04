import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div class="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-900/20">
        <i class="fa-solid fa-shield-halved text-5xl text-rose-400"></i>
      </div>
      <h1 class="text-6xl font-black text-slate-800 dark:text-white mb-2">403</h1>
      <h2 class="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">
        Acceso Denegado
      </h2>
      <p class="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
        No tienes los permisos necesarios para acceder a esta sección.
        Contacta al administrador si crees que esto es un error.
      </p>
      <button (click)="goBack()"
        class="flex items-center gap-2 rounded-lg bg-corporate-primary px-6 py-3 font-medium text-white transition hover:bg-opacity-90 shadow-md">
        <i class="fa-solid fa-arrow-left text-sm"></i>
        Volver al Dashboard
      </button>
    </div>
  `
})
export class ForbiddenComponent {
  private router = inject(Router);

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
