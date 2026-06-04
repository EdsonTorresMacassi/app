import { Injectable, signal, effect } from '@angular/core';

export type AppTheme = 'emerald' | 'blue' | 'purple' | 'slate';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDarkMode = signal<boolean>(false);
  currentAccent = signal<AppTheme>('emerald');

  constructor() {
    // Restaurar el estado guardado al iniciar la app
    const savedTheme = localStorage.getItem('app-theme') as AppTheme;
    if (savedTheme) {
      this.currentAccent.set(savedTheme);
    } else {
      // Default theme
      this.currentAccent.set('emerald');
    }

    const savedDark = localStorage.getItem('app-dark-mode');
    if (savedDark === 'true') {
      this.isDarkMode.set(true);
    } else if (savedDark === 'false') {
      this.isDarkMode.set(false);
    }

    // Efecto reactivo: cualquier cambio en los signals actualiza el DOM
    effect(() => {
      const dark = this.isDarkMode();
      const accent = this.currentAccent();
      const htmlEl = document.documentElement;

      // Aplicar/Quitar clase dark
      if (dark) {
        htmlEl.classList.add('dark');
        localStorage.setItem('app-dark-mode', 'true');
      } else {
        htmlEl.classList.remove('dark');
        localStorage.setItem('app-dark-mode', 'false');
      }

      // Aplicar/Quitar clases de tema
      htmlEl.classList.remove('theme-emerald', 'theme-blue', 'theme-purple', 'theme-slate');
      htmlEl.classList.add(`theme-${accent}`);
      localStorage.setItem('app-theme', accent);
    });
  }

  toggleDarkMode() {
    this.isDarkMode.update(v => !v);
  }

  setAccent(theme: AppTheme) {
    this.currentAccent.set(theme);
  }
}
