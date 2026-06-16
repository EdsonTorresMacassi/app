import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CellContext } from '@tanstack/angular-table';
import { UserResponse } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-user-info-cell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-corporate-primary/10 text-corporate-primary
                  flex items-center justify-center font-bold text-sm flex-shrink-0">
        {{ user().firstName.charAt(0).toUpperCase() }}
      </div>
      <div>
        <p class="font-semibold text-slate-800 dark:text-white">
          {{ user().firstName }} {{ user().lastName }}
        </p>
        <p class="text-xs text-slate-400">{{ user().email }}</p>
      </div>
    </div>
  `
})
export class UserInfoCellComponent {
  readonly context = input.required<CellContext<UserResponse, unknown>>();
  user = () => this.context().row.original;
}

@Component({
  selector: 'app-user-roles-cell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span *ngFor="let role of user().roles"
          class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
                 text-xs font-semibold mr-1
                 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400
                 border border-blue-200/50 dark:border-blue-800/50">
      <i class="fa-solid fa-shield text-[9px]"></i>
      {{ role }}
    </span>
    <span *ngIf="user().roles.length === 0" class="text-xs text-slate-400">Sin rol</span>
  `
})
export class UserRolesCellComponent {
  readonly context = input.required<CellContext<UserResponse, unknown>>();
  user = () => this.context().row.original;
}

@Component({
  selector: 'app-user-status-cell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span *ngIf="user().profileComplete"
          class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
                 text-xs font-semibold bg-emerald-50 text-emerald-700
                 dark:bg-emerald-900/30 dark:text-emerald-400
                 border border-emerald-200/50">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
      Completo
    </span>
    <span *ngIf="!user().profileComplete"
          class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
                 text-xs font-semibold bg-amber-50 text-amber-700
                 dark:bg-amber-900/30 dark:text-amber-400
                 border border-amber-200/50">
      <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
      Incompleto
    </span>
  `
})
export class UserStatusCellComponent {
  readonly context = input.required<CellContext<UserResponse, unknown>>();
  user = () => this.context().row.original;
}

@Component({
  selector: 'app-user-status-badge-cell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span *ngIf="user().status === 'ACTIVE' || user().status === 'A'"
          class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
                 text-xs font-semibold bg-emerald-50 text-emerald-700
                 dark:bg-emerald-900/30 dark:text-emerald-400
                 border border-emerald-200/50">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
      Activo
    </span>
    <span *ngIf="user().status === 'PENDING' || user().status === 'P'"
          class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
                 text-xs font-semibold bg-amber-50 text-amber-700
                 dark:bg-amber-900/30 dark:text-amber-400
                 border border-amber-200/50">
      <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
      Pendiente
    </span>
    <span *ngIf="user().status === 'INACTIVE' || user().status === 'I'"
          class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
                 text-xs font-semibold bg-rose-50 text-rose-700
                 dark:bg-rose-900/30 dark:text-rose-400
                 border border-rose-200/50">
      <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
      Inactivo
    </span>
  `
})
export class UserStatusBadgeCellComponent {
  readonly context = input.required<CellContext<UserResponse, unknown>>();
  user = () => this.context().row.original;
}

@Component({
  selector: 'app-user-actions-cell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-end gap-1">
      <ng-container *ngIf="user().status !== 'INACTIVE' && user().status !== 'I'">
        <button *ngIf="authService.hasPermission('USER_WRITE')"
                (click)="edit()"
                title="Editar usuario"
                class="w-8 h-8 flex items-center justify-center rounded-lg
                       text-slate-400 hover:text-amber-500 hover:bg-amber-50
                       dark:hover:bg-amber-900/20 transition-all">
          <i class="fa-solid fa-pen-to-square text-sm"></i>
        </button>
        <button *ngIf="authService.hasPermission('USER_WRITE')"
                (click)="disable()"
                title="Deshabilitar usuario"
                class="w-8 h-8 flex items-center justify-center rounded-lg
                       text-slate-400 hover:text-rose-500 hover:bg-rose-50
                       dark:hover:bg-rose-900/20 transition-all">
          <i class="fa-solid fa-ban text-sm"></i>
        </button>
        <button *ngIf="authService.hasPermission('USER_WRITE')"
                (click)="unlock()"
                title="Desbloquear usuario (fuerza bruta)"
                class="w-8 h-8 flex items-center justify-center rounded-lg
                       text-slate-400 hover:text-emerald-500 hover:bg-emerald-50
                       dark:hover:bg-emerald-900/20 transition-all">
          <i class="fa-solid fa-unlock text-sm"></i>
        </button>
      </ng-container>

      <ng-container *ngIf="user().status === 'INACTIVE' || user().status === 'I'">
        <button *ngIf="authService.hasPermission('USER_WRITE')"
                (click)="restore()"
                title="Restaurar usuario"
                class="w-8 h-8 flex items-center justify-center rounded-lg
                       text-emerald-500 hover:bg-emerald-50
                       dark:text-emerald-400 dark:hover:bg-emerald-900/20 transition-all">
          <i class="fa-solid fa-rotate-left text-sm"></i>
        </button>
      </ng-container>
    </div>
  `
})
export class UserActionsCellComponent {
  readonly context = input.required<CellContext<UserResponse, unknown>>();
  authService = inject(AuthService);
  
  user = () => this.context().row.original;

  edit() {
    const meta = this.context().column.columnDef.meta as any;
    if (meta?.onEdit) {
      meta.onEdit(this.context().row.original);
    }
  }

  disable() {
    const meta = this.context().column.columnDef.meta as any;
    if (meta?.onDisable) {
      meta.onDisable(this.context().row.original);
    }
  }

  unlock() {
    const meta = this.context().column.columnDef.meta as any;
    if (meta?.onUnlock) {
      meta.onUnlock(this.context().row.original);
    }
  }

  restore() {
    const meta = this.context().column.columnDef.meta as any;
    if (meta?.onRestore) {
      meta.onRestore(this.context().row.original);
    }
  }
}
