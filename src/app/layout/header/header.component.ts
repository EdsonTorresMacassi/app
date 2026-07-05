import { Component, inject, signal, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LayoutService } from '../../core/services/layout.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  layoutService = inject(LayoutService);
  authService = inject(AuthService);
  router = inject(Router);
  themeService = inject(ThemeService);

  currentUser = this.authService.currentUser;
  isDarkMode = this.themeService.isDarkMode;
  currentAccent = this.themeService.currentAccent;
  
  // Usando un signal para controlar el menú desplegable del usuario
  isDropdownOpen = signal(false);

  // Breadcrumbs signal
  breadcrumbs = signal<{label: string, url: string}[]>([]);

  ngOnInit() {
    this.updateBreadcrumbs(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateBreadcrumbs(event.urlAfterRedirects);
      this.closeDropdown();
    });
  }

  // Lógica simple para construir breadcrumbs desde la URL
  private updateBreadcrumbs(url: string) {
    const segments = url.split('?')[0].split('/').filter(segment => segment);
    const crumbs = [];
    let currentUrl = '';
    
    crumbs.push({ label: 'Inicio', url: '/' });
    
    segments.forEach(segment => {
      currentUrl += `/${segment}`;
      // Capitalizar y quitar guiones
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      crumbs.push({ label, url: currentUrl });
    });
    
    this.breadcrumbs.set(crumbs);
  }

  toggleSidebarMobile() {
    this.layoutService.toggleSidebarMobile();
  }

  toggleSidebarDesktop() {
    this.layoutService.toggleSidebarCollapse();
  }

  toggleTheme() {
    this.themeService.toggleDarkMode();
  }

  setAccent(theme: any) {
    this.themeService.setAccent(theme);
  }

  toggleDropdown() {
    this.isDropdownOpen.update(state => !state);
  }

  closeDropdown() {
    this.isDropdownOpen.set(false);
  }

  logout() {
    this.closeDropdown();
    this.authService.logout(); // Keycloak maneja la redirección
  }

  // Cerrar dropdown al hacer click fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    const clickedInside = targetElement.closest('.user-dropdown-container');
    if (!clickedInside && this.isDropdownOpen()) {
      this.closeDropdown();
    }
  }
}
