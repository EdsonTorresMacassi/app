import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { KeycloakInitService } from '../services/keycloak-init.service';
import { from, switchMap, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const keycloakService = inject(KeycloakInitService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si Keycloak dice que está logueado pero no tenemos el contexto
  // de negocio en memoria, cargarlo primero
  if (keycloakService.isLoggedIn() && !authService.currentUser()) {
    return from(authService.loadBusinessContext()).pipe(
      switchMap(ctx => {
        if (ctx.needsProfileCompletion) {
          return of(router.parseUrl('/profile/complete'));
        }
        return of(true);
      })
    );
  }

  if (!keycloakService.isLoggedIn()) {
    keycloakService.login();
    return false;
  }

  return true;
};
