import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  // Estado para el comportamiento "drawer" en móviles
  private isSidebarOpenMobileSignal = signal<boolean>(false);
  
  // Estado para el comportamiento "colapsado" en escritorio (iconos)
  private isSidebarCollapsedSignal = signal<boolean>(false);

  // Exponer señales de solo lectura
  readonly isSidebarOpenMobile = this.isSidebarOpenMobileSignal.asReadonly();
  readonly isSidebarCollapsed = this.isSidebarCollapsedSignal.asReadonly();

  // Controladores
  toggleSidebarMobile(): void {
    this.isSidebarOpenMobileSignal.update(state => !state);
  }

  setSidebarMobileState(isOpen: boolean): void {
    this.isSidebarOpenMobileSignal.set(isOpen);
  }

  toggleSidebarCollapse(): void {
    this.isSidebarCollapsedSignal.update(state => !state);
  }
}
