import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token inválido o expirado — Keycloak debería haberlo refrescado
        // Si llegamos aquí, la sesión expiró definitivamente
        authService.logout();
      }
      if (error.status === 403) {
        console.warn('Acceso denegado:', req.url);
        router.navigate(['/forbidden']);
      }
      return throwError(() => error);
    })
  );
};
