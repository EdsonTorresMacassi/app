import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { KeycloakInitService } from '../services/keycloak-init.service';
import { from, switchMap, of } from 'rxjs';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const keycloakService = inject(KeycloakInitService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si Keycloak dice que está logueado pero no tenemos el contexto
  // de negocio cargado en memoria en ESTA sesión, cargarlo primero
  if (keycloakService.isLoggedIn() && !authService.isContextLoaded()) {
    return from(authService.loadBusinessContext()).pipe(
      switchMap(ctx => {
        if (ctx.needsProfileCompletion && !state.url.includes('/profile/complete')) {
          return of(router.parseUrl('/profile/complete'));
        }
        if (!ctx.needsProfileCompletion && ctx.user.roles.length === 0 && !state.url.includes('/waiting-room')) {
          return of(router.parseUrl('/waiting-room'));
        }
        return of(true);
      })
    );
  }

  if (!keycloakService.isLoggedIn()) {
    keycloakService.login();
    return false;
  }

  // Si ya tenemos el contexto cargado, verificar redirecciones para navegación subsecuente
  if (authService.isContextLoaded()) {
    if (authService.needsProfileCompletion() && !state.url.includes('/profile/complete')) {
      return router.parseUrl('/profile/complete');
    }
    if (!authService.needsProfileCompletion() && (authService.currentUser()?.roles.length === 0) && !state.url.includes('/waiting-room')) {
      return router.parseUrl('/waiting-room');
    }
  }

  return true;
};
