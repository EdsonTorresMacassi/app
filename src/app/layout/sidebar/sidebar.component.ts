import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../../core/services/layout.service';
import { AuthService } from '../../core/services/auth.service';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  layoutService = inject(LayoutService);
  authService = inject(AuthService);
  navigationService = inject(NavigationService);

  // Señales de estado conectadas al servicio
  isSidebarOpenMobile = this.layoutService.isSidebarOpenMobile;
  isSidebarCollapsed = this.layoutService.isSidebarCollapsed;
  currentUser = this.authService.currentUser;

  // Set local para manejar expansión de submenús
  expandedMenus = signal<Set<string>>(new Set());

  // El menú llega filtrado por el backend
  filteredMenu = this.navigationService.menu;

  toggleSubMenu(title: string) {
    if (this.isSidebarCollapsed()) {
      // Si está colapsado, no se abren submenús clickeando el padre,
      // esto fuerza al usuario a expandir el sidebar si quiere ver el arbol.
      this.layoutService.toggleSidebarCollapse();
    }
    
    this.expandedMenus.update(set => {
      const newSet = new Set(set);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  }

  isSubMenuOpen(title: string): boolean {
    return this.expandedMenus().has(title) && !this.isSidebarCollapsed();
  }

  closeSidebarMobile() {
    if (window.innerWidth < 1024) {
      this.layoutService.setSidebarMobileState(false);
    }
  }
}
