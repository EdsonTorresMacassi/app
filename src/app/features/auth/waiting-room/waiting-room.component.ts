import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-waiting-room',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center border border-slate-100 dark:border-slate-700">
        <div class="mb-6 flex justify-center">
          <div class="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
            <i class="fa-solid fa-hourglass-half text-4xl text-amber-500 animate-pulse"></i>
          </div>
        </div>
        
        <h2 class="text-2xl font-bold text-slate-800 dark:text-white mb-3">
          ¡Cuenta en Revisión!
        </h2>
        
        <p class="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed text-sm">
          Tu perfil está completo, pero un Administrador del sistema debe asignarte los permisos correspondientes antes de que puedas ingresar. Por favor, espera a ser contactado o comunícate con soporte técnico.
        </p>

        <div class="space-y-3">
          <button (click)="logout()"
                  class="w-full border border-slate-200 dark:border-slate-600 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-xl transition-all active:scale-[0.98]">
            <i class="fa-solid fa-arrow-right-from-bracket mr-2"></i> Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  `
})
export class WaitingRoomComponent {
  private authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
