import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { UserService, UserResponse } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { CatalogService, CatalogItem } from '../../../core/services/catalog.service';
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
  private toastService = inject(ToastService);
  authService = inject(AuthService);

  users = signal<UserResponse[]>([]);
  docTypes = signal<CatalogItem[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  searchQuery = signal('');
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDisableModal = signal(false);
  selectedUser = signal<UserResponse | null>(null);
  selectedUserForEdit = signal<number | null>(null);

  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.users();
    return this.users().filter(u =>
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q)  ||
      u.email.toLowerCase().includes(q)     ||
      u.username.toLowerCase().includes(q)
    );
  });

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
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.error.set(null);
    this.userService.findAll().subscribe({
      next: users => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los usuarios. Intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
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
    this.selectedUser.set(user);
    this.showDisableModal.set(true);
  }
  closeDisableModal() {
    this.selectedUser.set(null);
    this.showDisableModal.set(false);
  }

  confirmDisable() {
    const user = this.selectedUser();
    if (!user) return;
    this.userService.disable(user.personId).subscribe({
      next: () => {
        this.closeDisableModal();
        this.toastService.success('Usuario deshabilitado exitosamente.');
        this.loadUsers();
      },
      error: () => this.toastService.error('Error al deshabilitar el usuario.')
    });
  }

  unlockUser(user: UserResponse) {
    this.userService.unlock(user.personId).subscribe({
      next: () => {
        this.toastService.success(`Se ha desbloqueado a ${user.firstName} exitosamente.`);
        this.loadUsers();
      },
      error: () => this.toastService.error('Error al intentar desbloquear al usuario.')
    });
  }

  restoreUser(user: UserResponse) {
    this.userService.restore(user.personId).subscribe({
      next: () => {
        this.toastService.success(`Usuario ${user.firstName} restaurado exitosamente.`);
        this.loadUsers();
      },
      error: () => this.toastService.error('Error al restaurar al usuario.')
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
