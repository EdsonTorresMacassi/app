import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KeycloakInitService {

  private keycloak: Keycloak;

  constructor() {
    this.keycloak = new Keycloak({
      url: environment.keycloak.url,
      realm: environment.keycloak.realm,
      clientId: environment.keycloak.clientId
    });
  }

  async init(): Promise<boolean> {
    return this.keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',
      checkLoginIframe: false
    });
  }

  getKeycloak(): Keycloak {
    return this.keycloak;
  }

  isLoggedIn(): boolean {
    return !!this.keycloak.authenticated;
  }

  async login(): Promise<void> {
    return this.keycloak.login({
      redirectUri: window.location.origin + '/dashboard'
    });
  }

  async logout(): Promise<void> {
    return this.keycloak.logout({
      redirectUri: window.location.origin + '/login'
    });
  }

  async getToken(): Promise<string | undefined> {
    // Refresca automáticamente si expira en menos de 30 segundos
    await this.keycloak.updateToken(30);
    return this.keycloak.token;
  }

  getTokenParsed(): Record<string, unknown> | undefined {
    return this.keycloak.tokenParsed as Record<string, unknown>;
  }
}
