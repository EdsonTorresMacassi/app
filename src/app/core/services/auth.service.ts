import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap, tap, of, catchError } from 'rxjs';
import { User } from '../models/user.interface';
import { ApiResponse, AuthResponse } from '../models/auth-response.interface';
import { KeycloakInitService } from './keycloak-init.service';
import { NavigationService } from './navigation.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private keycloakService = inject(KeycloakInitService);
  private navigationService = inject(NavigationService);

  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly USER_KEY = 'auth_user';

  private currentUserSignal = signal<User | null>(this.getUserFromStorage());
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUserSignal());
  readonly isAdmin = computed(() =>
    this.currentUserSignal()?.roles.includes('ADMIN') ?? false
  );
  readonly needsProfileCompletion = signal<boolean>(false);

  hasPermission(permission: string): boolean {
    return this.currentUserSignal()?.permissions.includes(permission) ?? false;
  }

  hasRole(role: string): boolean {
    return this.currentUserSignal()?.roles.includes(role) ?? false;
  }

  /**
   * Login: redirige a la pantalla de login de Keycloak.
   * Keycloak maneja toda la autenticación.
   * No hay formulario Angular de login.
   */
  login(): void {
    this.keycloakService.login();
  }

  /**
   * loadBusinessContext: se llama DESPUÉS de que Keycloak autentica al usuario.
   * Obtiene el JWT de Keycloak y llama al backend para cargar el contexto
   * de negocio (roles funcionales, permisos, menú dinámico) desde Oracle.
   */
  loadBusinessContext(): Observable<AuthResponse> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        if (!token) {
          throw new Error('No hay token de Keycloak disponible');
        }
        return this.http.post<ApiResponse<AuthResponse>>(
          `${this.API_URL}/context`, {}
        );
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
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSignal.set(user);
        this.navigationService.setMenu(authData.navigationMenu);
        this.needsProfileCompletion.set(authData.needsProfileCompletion);
      })
    );
  }

  /**
   * Logout: limpia el estado local y redirige a Keycloak para invalidar la sesión.
   */
  logout(): void {
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.navigationService.clearMenu();
    this.needsProfileCompletion.set(false);
    this.keycloakService.logout();
  }

  /**
   * Retorna el token JWT de Keycloak (con auto-refresh si está por expirar).
   * El jwtInterceptor usa este método para añadir el Bearer en cada request.
   */
  getAccessToken(): Promise<string | undefined> {
    return this.keycloakService.getToken();
  }

  isKeycloakLoggedIn(): boolean {
    return this.keycloakService.isLoggedIn();
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }
}
