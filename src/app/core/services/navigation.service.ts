import { Injectable, signal } from '@angular/core';
import { MenuItemDTO } from '../models/auth-response.interface';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private readonly MENU_KEY = 'nav_menu';

  private menuSignal = signal<MenuItemDTO[]>(this.getMenuFromStorage());
  readonly menu = this.menuSignal.asReadonly();

  setMenu(items: MenuItemDTO[]): void {
    sessionStorage.setItem(this.MENU_KEY, JSON.stringify(items));
    this.menuSignal.set(items);
  }

  clearMenu(): void {
    sessionStorage.removeItem(this.MENU_KEY);
    this.menuSignal.set([]);
  }

  private getMenuFromStorage(): MenuItemDTO[] {
    const stored = sessionStorage.getItem(this.MENU_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  }
}
