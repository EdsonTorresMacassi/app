import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService, CatalogItem } from '../../../core/services/catalog.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { GridComponent, GridColumnDef } from '@shared/components/grid/grid.component';
import { CatalogStatusCellComponent, CatalogActionsCellComponent } from './cells/catalog-grid-cells.component';
import Swal from 'sweetalert2';
import { ToastService } from '../../../core/services/toast.service';

const helper = createColumnHelper<CatalogItem>();

@Component({
  selector: 'app-catalog-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GridComponent],
  template: `
    <div class="space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800 dark:text-white font-heading">
            Gestión de Catálogos
          </h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {{ selectedMaster() ? 'Administrando ítems de ' + selectedMaster()?.name : 'Administra las listas desplegables del sistema (Maestros).' }}
          </p>
        </div>
        <div *ngIf="!selectedMaster()">
          <button (click)="openForm()" class="flex items-center gap-2 bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all shadow-sm text-sm">
            <i class="fa-solid fa-plus"></i> Nuevo Maestro
          </button>
        </div>
      </div>

      <!-- Level 1: Master Types List -->
      <div *ngIf="!selectedMaster()" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div *ngFor="let master of catalogMasters()" 
             class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 
                    dark:border-slate-700 hover:border-corporate-primary hover:shadow-md transition-all cursor-pointer relative group"
             (click)="selectMaster(master)">
          
          <!-- Actions for Master -->
          <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <button (click)="openForm(master); $event.stopPropagation()" class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-corporate-primary flex items-center justify-center" title="Editar">
              <i class="fa-solid fa-pen text-xs"></i>
            </button>
            <button (click)="deleteItem(master.catalogId!); $event.stopPropagation()" class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-rose-500 flex items-center justify-center" title="Eliminar">
              <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
          </div>

          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-corporate-primary/10 flex items-center justify-center flex-shrink-0">
              <i class="fa-solid fa-folder-tree text-corporate-primary text-xl"></i>
            </div>
            <div>
              <h3 class="font-bold text-slate-800 dark:text-white">{{ master.name }}</h3>
              <p class="text-xs text-slate-500 mt-1 font-mono">{{ master.code }}</p>
            </div>
          </div>
        </div>
        
        <!-- Loading State Level 1 -->
        <div *ngIf="isLoadingMasters()" class="col-span-full py-12 flex justify-center">
          <svg class="h-8 w-8 animate-spin text-corporate-primary" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>
        
        <div *ngIf="catalogMasters().length === 0 && !isLoadingMasters()" class="col-span-full py-12 text-center text-slate-500">
          No hay catálogos maestros creados. Haz clic en "Nuevo Maestro" para empezar.
        </div>
      </div>

      <!-- Level 2: Items List for Selected Master -->
      <div *ngIf="selectedMaster()" class="space-y-6">
        
        <div class="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-3">
            <button (click)="backToMasters()" class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-corporate-primary transition-colors">
              <i class="fa-solid fa-arrow-left"></i>
            </button>
            <h3 class="font-bold text-slate-800 dark:text-white text-lg">Ítems de {{ selectedMaster()?.name }}</h3>
          </div>
          <button (click)="openForm()" class="flex items-center gap-2 bg-corporate-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all shadow-sm text-sm">
            <i class="fa-solid fa-plus"></i> Nuevo Ítem
          </button>
        </div>

        <div class="mt-4">
          <app-grid
            [data]="items()"
            [columns]="columns"
            ariaLabel="Listado de ítems de catálogo"
            [pageSize]="10"
            [pageSizeOptions]="[10, 20, 50]"
            [stickyHeader]="true"
            [showPagination]="true"
            [resizableColumns]="true"
            [loading]="isLoadingItems()"
            emptyTitle="No hay ítems en este catálogo"
            emptyDescription="No existen ítems registrados. Haz clic en 'Nuevo Ítem' para crear uno."
          ></app-grid>
        </div>
      </div>

    </div>

    <!-- Modal Form -->
    <div *ngIf="showForm()" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div class="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
          <h3 class="font-bold text-lg text-slate-800 dark:text-white">
            {{ editingItem() ? 'Editar' : 'Nuevo' }} {{ selectedMaster() ? 'Ítem' : 'Maestro' }}
          </h3>
          <button (click)="closeForm()" class="text-slate-400 hover:text-slate-600 transition-colors"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <form [formGroup]="form" (ngSubmit)="saveItem()" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Código *</label>
            <input formControlName="code" type="text" class="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm outline-none focus:border-corporate-primary" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nombre *</label>
            <input formControlName="name" type="text" class="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm outline-none focus:border-corporate-primary" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Orden *</label>
              <input formControlName="sortOrder" type="number" class="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm outline-none focus:border-corporate-primary" />
            </div>
            <div class="flex items-center pt-6">
              <label class="flex items-center gap-2 cursor-pointer">
                <input formControlName="isActive" type="checkbox" class="rounded border-slate-300 text-corporate-primary focus:ring-corporate-primary" />
                <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Activo</span>
              </label>
            </div>
          </div>
          <div *ngIf="error()" class="p-3 bg-rose-50 text-rose-700 text-sm rounded-lg border border-rose-200">
            {{ error() }}
          </div>
          <div class="pt-4 flex gap-3">
            <button type="button" (click)="closeForm()" class="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" [disabled]="form.invalid || isSaving()" class="flex-1 px-4 py-2.5 rounded-lg bg-corporate-primary text-white font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50">
              {{ isSaving() ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CatalogManagementComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  readonly columns: GridColumnDef<CatalogItem>[] = [
    helper.accessor('code', {
      id: 'codigo',
      header: 'Código',
      size: 150,
      enableSorting: true
    }),
    helper.accessor('name', {
      id: 'nombre',
      header: 'Nombre',
      size: 250,
      enableSorting: true
    }),
    helper.accessor('sortOrder', {
      id: 'orden',
      header: 'Orden',
      size: 100,
      enableSorting: true
    }),
    helper.accessor('isActive', {
      id: 'estado',
      header: 'Estado',
      size: 120,
      enableSorting: true,
      meta: { align: 'center' },
      cell: (info) => flexRenderComponent(CatalogStatusCellComponent, { inputs: { context: info } })
    }),
    helper.display({
      id: 'acciones',
      header: 'Acciones',
      size: 140,
      meta: {
        align: 'right',
        onEdit: (item: CatalogItem) => this.openForm(item),
        onToggleStatus: (id: number, status: boolean) => this.toggleItemStatus(id, status),
        onDelete: (id: number) => this.deleteItem(id)
      },
      cell: (info) => flexRenderComponent(CatalogActionsCellComponent, { inputs: { context: info } })
    })
  ];

  catalogMasters = signal<CatalogItem[]>([]);
  selectedMaster = signal<CatalogItem | null>(null);
  items = signal<CatalogItem[]>([]);
  
  isLoadingMasters = signal(false);
  isLoadingItems = signal(false);

  showForm = signal(false);
  editingItem = signal<CatalogItem | null>(null);
  isSaving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    sortOrder: [0, Validators.required],
    isActive: [true]
  });

  ngOnInit() {
    this.loadMasters();
  }

  loadMasters() {
    this.isLoadingMasters.set(true);
    this.catalogService.getCatalogMasters().subscribe({
      next: masters => {
        this.catalogMasters.set(masters);
        this.isLoadingMasters.set(false);
      },
      error: () => this.isLoadingMasters.set(false)
    });
  }

  selectMaster(master: CatalogItem) {
    this.selectedMaster.set(master);
    this.loadItems(master.catalogId!);
  }

  backToMasters() {
    this.selectedMaster.set(null);
    this.items.set([]);
    this.loadMasters(); 
  }

  loadItems(parentId: number) {
    this.isLoadingItems.set(true);
    this.catalogService.getCatalogsAdmin(parentId, 0, 100).subscribe({
      next: res => {
        this.items.set(res.content || []);
        this.isLoadingItems.set(false);
      },
      error: () => this.isLoadingItems.set(false)
    });
  }

  openForm(item?: CatalogItem) {
    this.error.set(null);
    if (item) {
      this.editingItem.set(item);
      this.form.patchValue(item);
    } else {
      this.editingItem.set(null);
      this.form.reset({ sortOrder: 0, isActive: true });
    }
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingItem.set(null);
  }

  saveItem() {
    if (this.form.invalid) return;
    this.isSaving.set(true);
    this.error.set(null);

    const payload = {
      ...this.form.getRawValue(),
      parentId: this.selectedMaster() ? this.selectedMaster()!.catalogId : undefined
    };

    const cacheKey = this.selectedMaster() ? this.selectedMaster()!.code : undefined;

    const req$ = this.editingItem()
      ? this.catalogService.updateCatalog(this.editingItem()!.catalogId!, payload, cacheKey)
      : this.catalogService.createCatalog(payload, cacheKey);

    req$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeForm();
        if (this.selectedMaster()) {
          this.loadItems(this.selectedMaster()!.catalogId!);
        } else {
          this.loadMasters();
        }
        this.toastService.success(`El registro ha sido ${this.editingItem() ? 'actualizado' : 'creado'} exitosamente.`);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.error.set(err.error?.message || 'Error al guardar el ítem.');
        this.toastService.error('No se pudo guardar el registro.');
      }
    });
  }

  toggleItemStatus(id: number, currentStatus: boolean) {
    const action = currentStatus ? 'desactivar' : 'activar';
    const actionText = currentStatus ? 'Desactivar' : 'Activar';
    Swal.fire({
      title: `¿${actionText} este registro?`,
      text: currentStatus ? 'El registro dejará de estar visible en las listas desplegables.' : 'El registro volverá a estar disponible para su uso.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900',
        title: 'text-2xl font-bold text-slate-800 dark:text-white',
        htmlContainer: 'text-slate-500 dark:text-slate-400',
        actions: 'gap-3',
        confirmButton: 'bg-corporate-primary hover:bg-opacity-90 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm',
        cancelButton: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-6 py-2.5 rounded-xl font-semibold transition-all'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        const cacheKey = this.selectedMaster() ? this.selectedMaster()!.code : undefined;
        this.catalogService.toggleCatalogStatus(id, cacheKey).subscribe({
          next: () => {
            if (this.selectedMaster()) {
              this.loadItems(this.selectedMaster()!.catalogId!);
            } else {
              this.loadMasters();
            }
            this.toastService.info(`El registro ha sido ${currentStatus ? 'desactivado' : 'activado'}.`);
          },
          error: (err) => {
            console.error(err);
            this.toastService.error('No se pudo actualizar el estado del registro.');
          }
        });
      }
    });
  }

  deleteItem(id: number) {
    Swal.fire({
      title: '¿Eliminar registro?',
      text: 'Desaparecerá de las listas pero se conservará en el historial de la base de datos.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900',
        title: 'text-2xl font-bold text-slate-800 dark:text-white',
        htmlContainer: 'text-slate-500 dark:text-slate-400',
        actions: 'gap-3',
        confirmButton: 'bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm',
        cancelButton: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-6 py-2.5 rounded-xl font-semibold transition-all'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        const cacheKey = this.selectedMaster() ? this.selectedMaster()!.code : undefined;
        this.catalogService.deleteCatalog(id, cacheKey).subscribe({
          next: () => {
            if (this.selectedMaster()) {
              this.loadItems(this.selectedMaster()!.catalogId!);
            } else {
              this.loadMasters();
            }
            this.toastService.info('El registro ha sido eliminado del sistema.');
          },
          error: (err) => {
            console.error(err);
            this.toastService.error('No se pudo eliminar el registro.');
          }
        });
      }
    });
  }
}
