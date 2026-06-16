import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

/**
 * Estrategia de preloading selectiva.
 * Solo precarga los módulos que tienen data.preload = true en la ruta.
 * Reemplaza PreloadAllModules para evitar descargar todos los lazy chunks
 * en el arranque inicial de la app.
 *
 * Configurar en app.config.ts:
 *   provideRouter(routes, withPreloading(SelectivePreloadingStrategy))
 */
@Injectable({ providedIn: 'root' })
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    return route.data?.['preload'] === true ? load() : of(null);
  }
}
