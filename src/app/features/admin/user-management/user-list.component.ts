import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RoleService } from '../../../core/services/role.service';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { UserService } from '../../../core/services/user.service';
import { UserResponse } from '../../../core/models/user/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { CatalogItem } from '../../../core/models/catalog/catalog.model';
import { CreateUserFormComponent } from './create-user-form.component';
import { EditUserFormComponent } from './edit-user-form.component';
import { GridComponent, GridColumnDef } from '@shared/components/grid/grid.component';
import {
  UserInfoCellComponent,
  UserRolesCellComponent,
  UserStatusCellComponent,
  UserActionsCellComponent,
  UserStatusBadgeCellComponent
} from './cells/user-grid-cells.component';
import { ToastService } from '../../../core/services/toast.service';
import Swal from 'sweetalert2';

const helper = createColumnHelper<UserResponse>();

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CreateUserFormComponent, EditUserFormComponent, GridComponent],
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private catalogService = inject(CatalogService);
  private roleService = inject(RoleService);
  private toastService = inject(ToastService);
  authService = inject(AuthService);

  users = signal<UserResponse[]>([]);
  docTypes = signal<CatalogItem[]>([]);
  roles = signal<any[]>([]); 
  
  // Paginación y Filtrado Server-Side
  isLoading = signal(true);
  error = signal<string | null>(null);
  
  pageIndex = signal(0);
  pageSize = signal(10);
  totalElements = signal(0);
  totalPages = signal(0);

  filters = signal({
    keyword: '',
    docNumber: '',
    status: '',
    roleName: ''
  });

  showCreateModal = signal(false);
  showEditModal = signal(false);
  selectedUserForEdit = signal<number | null>(null);

  readonly columns: GridColumnDef<UserResponse>[] = [
    helper.accessor('firstName', {
      id: 'usuario',
      header: 'Usuario',
      size: 250,
      enableSorting: true,
      cell: (info) => flexRenderComponent(UserInfoCellComponent, { inputs: { context: info } })
    }),
    helper.accessor('docNumber', {
      id: 'documento',
      header: 'Documento',
      size: 150,
      enableSorting: true,
      cell: (info) => {
        const typeId = info.row.original.docType;
        const docName = this.docTypes().find(c => String(c.catalogId) === String(typeId))?.name || typeId || '—';
        return `${docName}: ${info.getValue() || '—'}`;
      }
    }),
    helper.display({
      id: 'roles',
      header: 'Rol',
      size: 180,
      cell: (info) => flexRenderComponent(UserRolesCellComponent, { inputs: { context: info } })
    }),
    helper.accessor('status', {
      id: 'estado',
      header: 'Estado',
      size: 120,
      enableSorting: true,
      cell: (info) => flexRenderComponent(UserStatusBadgeCellComponent, { inputs: { context: info } })
    }),
    helper.accessor('profileComplete', {
      id: 'perfil',
      header: 'Perfil',
      size: 120,
      enableSorting: true,
      cell: (info) => flexRenderComponent(UserStatusCellComponent, { inputs: { context: info } })
    }),
    helper.display({
      id: 'acciones',
      header: 'Acciones',
      size: 120,
      meta: {
        align: 'right',
        onEdit: (user: UserResponse) => this.openEditModal(user),
        onDisable: (user: UserResponse) => this.openDisableModal(user),
        onUnlock: (user: UserResponse) => this.unlockUser(user),
        onRestore: (user: UserResponse) => this.restoreUser(user)
      },
      cell: (info) => flexRenderComponent(UserActionsCellComponent, { inputs: { context: info } })
    })
  ];

  ngOnInit() {
    this.catalogService.getActiveCatalogsByType('DOC_TYPE').subscribe(d => this.docTypes.set(d));
    this.roleService.findAll().subscribe(r => {
      this.roles.set(r.map(role => ({ name: role.roleName })));
    });
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.error.set(null);
    this.userService.findAll(this.pageIndex(), this.pageSize(), this.filters()).subscribe({
      next: page => {
        this.users.set(page.content);
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los usuarios. Intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(newPageIndex: number) {
    this.pageIndex.set(newPageIndex);
    this.loadUsers();
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize.set(newPageSize);
    this.pageIndex.set(0); // Regresar a la primera página al cambiar el tamaño
    this.loadUsers();
  }

  applyFilters() {
    this.pageIndex.set(0);
    this.loadUsers();
  }

  clearFilters() {
    this.filters.set({ keyword: '', docNumber: '', status: '', roleName: '' });
    this.pageIndex.set(0);
    this.loadUsers();
  }

  openCreateModal() { this.showCreateModal.set(true); }
  closeCreateModal() { this.showCreateModal.set(false); }

  openEditModal(user: UserResponse) {
    this.selectedUserForEdit.set(user.personId);
    this.showEditModal.set(true);
  }
  closeEditModal() {
    this.selectedUserForEdit.set(null);
    this.showEditModal.set(false);
  }

  openDisableModal(user: UserResponse) {
    Swal.fire({
      title: '¿Deshabilitar usuario?',
      text: `¿Estás seguro de deshabilitar a ${user.firstName} ${user.lastName}? El usuario perderá acceso al sistema inmediatamente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, deshabilitar',
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
        this.userService.disable(user.personId).subscribe({
          next: () => {
            this.toastService.success('Usuario deshabilitado exitosamente.');
            this.loadUsers();
          },
          error: () => this.toastService.error('Error al deshabilitar el usuario.')
        });
      }
    });
  }

  unlockUser(user: UserResponse) {
    Swal.fire({
      title: '¿Desbloquear usuario?',
      text: `¿Estás seguro de desbloquear a ${user.firstName}? Podrá volver a intentar iniciar sesión.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, desbloquear',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900',
        title: 'text-2xl font-bold text-slate-800 dark:text-white',
        htmlContainer: 'text-slate-500 dark:text-slate-400',
        actions: 'gap-3',
        confirmButton: 'bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm',
        cancelButton: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-6 py-2.5 rounded-xl font-semibold transition-all'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.unlock(user.personId).subscribe({
          next: () => {
            this.toastService.success(`Se ha desbloqueado a ${user.firstName} exitosamente.`);
            this.loadUsers();
          },
          error: () => this.toastService.error('Error al intentar desbloquear al usuario.')
        });
      }
    });
  }

  restoreUser(user: UserResponse) {
    Swal.fire({
      title: '¿Restaurar usuario?',
      text: `¿Estás seguro de restaurar a ${user.firstName}? Volverá a tener acceso al sistema.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900',
        title: 'text-2xl font-bold text-slate-800 dark:text-white',
        htmlContainer: 'text-slate-500 dark:text-slate-400',
        actions: 'gap-3',
        confirmButton: 'bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm',
        cancelButton: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-6 py-2.5 rounded-xl font-semibold transition-all'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.restore(user.personId).subscribe({
          next: () => {
            this.toastService.success(`Usuario ${user.firstName} restaurado exitosamente.`);
            this.loadUsers();
          },
          error: () => this.toastService.error('Error al restaurar al usuario.')
        });
      }
    });
  }

  onUserCreated() {
    this.closeCreateModal();
    this.toastService.success('El usuario se creó correctamente en el sistema.');
    this.loadUsers();
  }

  onUserEdited() {
    this.closeEditModal();
    this.toastService.success('Los datos del usuario se actualizaron correctamente.');
    this.loadUsers();
  }
}
