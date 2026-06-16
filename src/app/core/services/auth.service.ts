import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap, tap, of, catchError } from 'rxjs';
import { ApiResponse, AuthResponse, User } from '../models/api.models';
import { KeycloakInitService } from './keycloak-init.service';
import { NavigationService } from './navigation.service';
import { environment } from '../../../environments/environment';

/**
 * AuthService — Gestión del estado de autenticación y contexto de negocio.
 *
 * SEGURIDAD:
 * - El user context (roles, permisos) se guarda SOLO en Signal (memoria).
 * - sessionStorage guarda únicamente userId y username para restaurar
 *   el estado en un refresh de página (sin datos sensibles de permisos).
 * - El token JWT lo gestiona Keycloak (no Angular) — solo se lee al vuelo.
 * - Los permisos siempre se reconstruyen desde el backend al recargar.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private keycloakService = inject(KeycloakInitService);
  private navigationService = inject(NavigationService);

  private readonly API_URL = `${environment.apiUrl}/auth`;
  // sessionStorage solo para señal de "usuario ya autenticado" — sin permisos
  private readonly SESSION_KEY = 'app_session_uid';

  // Estado en memoria — no persiste en storage (protección XSS)
  private currentUserSignal = signal<User | null>(null);
  private _contextLoaded = false;

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUserSignal());
  readonly isAdmin = computed(() =>
    this.currentUserSignal()?.roles.includes('ADMIN') ?? false
  );
  readonly needsProfileCompletion = signal<boolean>(false);

  isContextLoaded(): boolean {
    return this._contextLoaded;
  }

  hasPermission(permission: string): boolean {
    return this.currentUserSignal()?.permissions.includes(permission) ?? false;
  }

  hasRole(role: string): boolean {
    return this.currentUserSignal()?.roles.includes(role) ?? false;
  }

  /**
   * ¿Existe una sesión activa (aunque no hayamos cargado el contexto)?
   * Usa sessionStorage solo para señal de sesión — no contiene permisos.
   */
  hasActiveSession(): boolean {
    return !!sessionStorage.getItem(this.SESSION_KEY);
  }

  /**
   * Login — redirige a Keycloak. No hay formulario Angular.
   */
  login(): void {
    this.keycloakService.login();
  }

  /**
   * Carga el contexto de negocio desde Oracle a través del backend.
   * Siempre llamado después de que Keycloak autentica al usuario.
   * El resultado se guarda SOLO en memoria (Signal).
   */
  loadBusinessContext(): Observable<AuthResponse> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        if (!token) {
          throw new Error('No hay token de Keycloak disponible');
        }
        return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/context`, {});
      }),
      switchMap(response => of(response.data)),
      tap(authData => {
        const user: User = {
          userId: authData.user.userId,
          username: authData.user.username,
          roles: authData.user.roles,
          permissions: authData.user.permissions,
          person: authData.user.person
        };

        // Estado en memoria — seguro contra XSS
        this.currentUserSignal.set(user);
        this.navigationService.setMenu(authData.navigationMenu);
        this.needsProfileCompletion.set(authData.needsProfileCompletion);
        this._contextLoaded = true;

        // sessionStorage: solo el UID de sesión (sin roles ni permisos)
        sessionStorage.setItem(this.SESSION_KEY, user.userId.toString());
      }),
      catchError(err => {
        this.clearState();
        throw err;
      })
    );
  }

  /**
   * Logout — limpia estado local y redirige a Keycloak.
   */
  logout(): void {
    this.clearState();
    this.keycloakService.logout();
  }

  /**
   * Retorna el token JWT de Keycloak (con auto-refresh automático si está por expirar).
   * El jwtInterceptor usa este método para añadir Bearer en cada request.
   */
  getAccessToken(): Promise<string | undefined> {
    return this.keycloakService.getToken();
  }

  isKeycloakLoggedIn(): boolean {
    return this.keycloakService.isLoggedIn();
  }

  private clearState(): void {
    this.currentUserSignal.set(null);
    this.navigationService.clearMenu();
    this.needsProfileCompletion.set(false);
    this._contextLoaded = false;
    sessionStorage.removeItem(this.SESSION_KEY);
    // Asegurar que no queden datos en localStorage de versiones anteriores
    localStorage.removeItem('auth_user');
  }
}
