import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { KeycloakInitService } from '../services/keycloak-init.service';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloakService = inject(KeycloakInitService);

  // Solo añadir el token en requests al backend de la app
  // Usa environment.apiUrl para no romper en producción con URL distinta
  const isApiRequest = req.url.startsWith(environment.apiUrl);

  if (!isApiRequest) {
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
