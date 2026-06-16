import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CellContext } from '@tanstack/angular-table';
import { CatalogItem } from '../../../../core/services/catalog.service';

@Component({
  selector: 'app-catalog-status-cell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex justify-center">
      <span [class]="item().isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'"
            class="px-2.5 py-1 rounded-full text-xs font-semibold">
        {{ item().isActive ? 'Activo' : 'Inactivo' }}
      </span>
    </div>
  `
})
export class CatalogStatusCellComponent {
  readonly context = input.required<CellContext<CatalogItem, unknown>>();
  item = () => this.context().row.original;
}

@Component({
  selector: 'app-catalog-actions-cell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-end gap-2">
      <button (click)="edit()" class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-corporate-primary transition-colors flex items-center justify-center" title="Editar">
        <i class="fa-solid fa-pen text-xs"></i>
      </button>
      <button (click)="toggleStatus()" 
              [class]="item().isActive ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'"
              class="w-8 h-8 rounded-lg transition-colors flex items-center justify-center" 
              [title]="item().isActive ? 'Desactivar' : 'Activar'">
        <i class="fa-solid fa-power-off text-xs"></i>
      </button>
      <button (click)="delete()" class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-rose-500 transition-colors flex items-center justify-center" title="Eliminar">
        <i class="fa-solid fa-trash-can text-xs"></i>
      </button>
    </div>
  `
})
export class CatalogActionsCellComponent {
  readonly context = input.required<CellContext<CatalogItem, unknown>>();
  item = () => this.context().row.original;

  edit() {
    const meta = this.context().column.columnDef.meta as any;
    if (meta?.onEdit) meta.onEdit(this.item());
  }

  toggleStatus() {
    const meta = this.context().column.columnDef.meta as any;
    if (meta?.onToggleStatus) meta.onToggleStatus(this.item().catalogId, this.item().isActive);
  }

  delete() {
    const meta = this.context().column.columnDef.meta as any;
    if (meta?.onDelete) meta.onDelete(this.item().catalogId);
  }
}
