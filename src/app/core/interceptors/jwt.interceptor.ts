import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { KeycloakInitService } from '../services/keycloak-init.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloakService = inject(KeycloakInitService);

  // Solo añadir el token en requests al backend (no a Keycloak ni otros)
  if (!req.url.includes('localhost:8081') &&
      !req.url.includes('/api/')) {
    return next(req);
  }

  return from(keycloakService.getToken()).pipe(
    switchMap(token => {
      if (token) {
        const clonedReq = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
        return next(clonedReq);
      }
      return next(req);
    })
  );
};
