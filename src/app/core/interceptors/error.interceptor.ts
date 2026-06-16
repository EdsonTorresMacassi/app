import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

/**
 * Interceptor de errores HTTP global.
 * Maneja: 401, 403, 500, 503/504 con respuestas apropiadas.
 * No muestra toasts directamente — delega al errorMessage$ observable
 * para que los componentes elijan cómo notificar al usuario.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          // Token inválido o sesión expirada — cerrar sesión
          authService.logout();
          break;

        case 403:
          // Acceso denegado — redirigir a página de error
          router.navigate(['/forbidden']);
          break;

        case 0:
        case 503:
        case 504:
          // Backend caído o timeout — no redirigir, dejar que el componente maneje
          console.error('Servicio no disponible o timeout:', req.url);
          break;

        case 500:
          // Error interno del servidor
          console.error('Error interno del servidor:', req.url, error.error?.message);
          break;

        default:
          if (error.status >= 400) {
            console.warn(`Error HTTP ${error.status}:`, req.url);
          }
      }

      // Propagar el error para que los componentes puedan mostrar mensajes específicos
      return throwError(() => error);
    })
  );
};
