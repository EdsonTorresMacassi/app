import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CellContext } from '@tanstack/angular-table';
import { CatalogItem } from '../../../../core/models/catalog/catalog.model';

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
    <div class="flex items-center justify-end gap-1.5">
      <button *ngIf="hasViewItems()" (click)="viewItems()" 
              class="w-9 h-9 rounded-full text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
              title="Ver Ítems">
        <i class="fa-solid fa-list-ul text-[13px]"></i>
      </button>

      <button (click)="edit()" 
              class="w-9 h-9 rounded-full text-amber-500 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/30 transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-500/50" 
              title="Editar">
        <i class="fa-solid fa-pen-to-square text-[13px]"></i>
      </button>

      <button (click)="toggleStatus()" 
              [class]="item().isActive 
                ? 'text-rose-500 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30 focus:ring-rose-500/50' 
                : 'text-emerald-500 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30 focus:ring-emerald-500/50'"
              class="w-9 h-9 rounded-full transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2" 
              [title]="item().isActive ? 'Desactivar' : 'Activar'">
        <i class="fa-solid text-[13px]" [ngClass]="item().isActive ? 'fa-ban' : 'fa-rotate-left'"></i>
      </button>

      <button (click)="delete()" 
              class="w-9 h-9 rounded-full text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500/50" 
              title="Eliminar">
        <i class="fa-solid fa-trash-can text-[13px]"></i>
      </button>
    </div>
  `
})
export class CatalogActionsCellComponent {
  readonly context = input.required<CellContext<CatalogItem, unknown>>();
  item = () => this.context().row.original;

  hasViewItems() {
    return !!(this.context().column.columnDef.meta as any)?.onViewItems;
  }

  viewItems() {
    const meta = this.context().column.columnDef.meta as any;
    if (meta?.onViewItems) meta.onViewItems(this.item());
  }

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
