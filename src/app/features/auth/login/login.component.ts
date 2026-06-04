import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { KeycloakInitService } from '../../../core/services/keycloak-init.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="flex h-screen w-full items-center justify-center
                bg-gradient-to-br from-slate-50 to-slate-100
                dark:from-slate-900 dark:to-slate-800">
      <div class="text-center">
        <div class="mb-6 mx-auto w-20 h-20 bg-corporate-primary rounded-2xl
                    flex items-center justify-center shadow-lg">
          <i class="fa-solid fa-layer-group text-3xl text-white"></i>
        </div>
        <h2 class="text-2xl font-bold text-slate-800 dark:text-white mb-2
                   font-heading">
          Sistema de Gestión
        </h2>
        <p class="text-slate-500 dark:text-slate-400 mb-8 text-sm">
          Redirigiendo al portal de autenticación...
        </p>
        <svg class="mx-auto h-8 w-8 animate-spin text-corporate-primary"
             viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private keycloakService = inject(KeycloakInitService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    if (this.keycloakService.isLoggedIn()) {
      // Ya autenticado — cargar contexto y navegar
      this.authService.loadBusinessContext().subscribe({
        next: (ctx) => {
          if (ctx.needsProfileCompletion) {
            this.router.navigate(['/profile/complete']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: () => this.router.navigate(['/dashboard'])
      });
    } else {
      // No autenticado — redirigir a Keycloak inmediatamente
      this.keycloakService.login();
    }
  }
}
