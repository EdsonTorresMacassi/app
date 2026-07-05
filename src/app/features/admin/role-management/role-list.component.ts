import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoleService } from '../../../core/services/role.service';
import { RoleResponse, PermissionResponse, RoleRequest, PermissionRequest } from '../../../core/models/role/role.model';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './role-list.component.html'
})
export class RoleListComponent implements OnInit {
  private roleService = inject(RoleService);
  authService = inject(AuthService);

  roles       = signal<RoleResponse[]>([]);
  allPerms    = signal<PermissionResponse[]>([]);
  isLoading   = signal(true);
  error       = signal<string | null>(null);
  expandedRole = signal<number | null>(null);

  // Agrupar permisos por módulo para mostrarlos organizados
  permsByModule = signal<Record<string, PermissionResponse[]>>({});

  private fb = inject(FormBuilder);

  activeTab = signal<'roles' | 'permissions'>('roles');

  // Modales
  showRoleModal = signal(false);
  showPermModal = signal(false);
  isSaving = signal(false);

  editingRole = signal<RoleResponse | null>(null);
  editingPerm = signal<PermissionResponse | null>(null);

  roleForm: FormGroup = this.fb.group({
    roleName: ['', [Validators.required, Validators.minLength(3)]],
    description: ['']
  });
  
  // Para los checkboxes de permisos en el form de rol
  selectedPermissionIds = signal<number[]>([]);

  permForm: FormGroup = this.fb.group({
    permCode: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    permModule: ['', Validators.required]
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.roleService.findAll().subscribe({
      next: roles => { this.roles.set(roles); this.isLoading.set(false); },
      error: () => {
        this.error.set('Error cargando roles.');
        this.isLoading.set(false);
      }
    });

    this.roleService.findAllPermissions().subscribe({
      next: perms => {
        this.allPerms.set(perms);
        const grouped = perms.reduce((acc, p) => {
          if (!acc[p.permModule]) acc[p.permModule] = [];
          acc[p.permModule].push(p);
          return acc;
        }, {} as Record<string, PermissionResponse[]>);
        this.permsByModule.set(grouped);
      }
    });
  }

  toggleRole(roleId: number) {
    this.expandedRole.update(curr => curr === roleId ? null : roleId);
  }

  hasPermission(role: RoleResponse, permCode: string | undefined): boolean {
    if (!permCode) return false;
    return role.permissions.some(p => p.permCode === permCode);
  }

  getModules(): string[] {
    return Object.keys(this.permsByModule());
  }

  setTab(tab: 'roles' | 'permissions') {
    this.activeTab.set(tab);
  }

  // --- CRUD ROLES ---

  openRoleForm(role?: RoleResponse) {
    this.editingRole.set(role || null);
    if (role) {
      this.roleForm.patchValue({
        roleName: role.roleName,
        description: role.description
      });
      this.selectedPermissionIds.set(role.permissions.map(p => p.permissionId));
    } else {
      this.roleForm.reset();
      this.selectedPermissionIds.set([]);
    }
    this.showRoleModal.set(true);
  }

  closeRoleForm() {
    this.showRoleModal.set(false);
    this.editingRole.set(null);
  }

  togglePermissionSelection(permId: number) {
    const current = this.selectedPermissionIds();
    if (current.includes(permId)) {
      this.selectedPermissionIds.set(current.filter(id => id !== permId));
    } else {
      this.selectedPermissionIds.set([...current, permId]);
    }
  }

  saveRole() {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    const req: RoleRequest = {
      ...this.roleForm.value,
      permissionIds: this.selectedPermissionIds()
    };
    
    const obs$ = this.editingRole() 
      ? this.roleService.updateRole(this.editingRole()!.roleId, req)
      : this.roleService.createRole(req);

    obs$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeRoleForm();
        this.loadData();
        Swal.fire({
          title: '¡Guardado!', text: 'El rol ha sido guardado exitosamente.', icon: 'success',
          customClass: { popup: 'rounded-3xl', confirmButton: 'bg-corporate-primary text-white px-6 py-2.5 rounded-xl' },
          buttonsStyling: false
        });
      },
      error: () => {
        this.isSaving.set(false);
        Swal.fire({
          title: 'Error', text: 'No se pudo guardar el rol.', icon: 'error',
          customClass: { popup: 'rounded-3xl', confirmButton: 'bg-rose-500 text-white px-6 py-2.5 rounded-xl' },
          buttonsStyling: false
        });
      }
    });
  }

  deleteRole(role: RoleResponse) {
    Swal.fire({
      title: '¿Eliminar Rol?',
      text: `¿Estás seguro de eliminar el rol "${role.roleName}"?`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-3xl',
        actions: 'gap-3',
        confirmButton: 'bg-rose-500 text-white px-6 py-2.5 rounded-xl',
        cancelButton: 'bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        this.roleService.deleteRole(role.roleId).subscribe({
          next: () => {
            this.loadData();
            Swal.fire({ title: '¡Eliminado!', icon: 'success', customClass: { popup: 'rounded-3xl', confirmButton: 'bg-corporate-primary text-white px-6 py-2.5 rounded-xl' }, buttonsStyling: false });
          },
          error: () => Swal.fire({ title: 'Error', text: 'No se pudo eliminar.', icon: 'error', customClass: { popup: 'rounded-3xl', confirmButton: 'bg-rose-500 text-white px-6 py-2.5 rounded-xl' }, buttonsStyling: false })
        });
      }
    });
  }

  // --- CRUD PERMISSIONS ---

  openPermForm(perm?: PermissionResponse) {
    this.editingPerm.set(perm || null);
    if (perm) {
      this.permForm.patchValue({
        permCode: perm.permCode,
        description: perm.description,
        permModule: perm.permModule
      });
    } else {
      this.permForm.reset();
    }
    this.showPermModal.set(true);
  }

  closePermForm() {
    this.showPermModal.set(false);
    this.editingPerm.set(null);
  }

  savePermission() {
    if (this.permForm.invalid) {
      this.permForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    const req: PermissionRequest = this.permForm.value;
    
    const obs$ = this.editingPerm() 
      ? this.roleService.updatePermission(this.editingPerm()!.permissionId, req)
      : this.roleService.createPermission(req);

    obs$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closePermForm();
        this.loadData();
        Swal.fire({ title: '¡Guardado!', icon: 'success', customClass: { popup: 'rounded-3xl', confirmButton: 'bg-corporate-primary text-white px-6 py-2.5 rounded-xl' }, buttonsStyling: false });
      },
      error: () => {
        this.isSaving.set(false);
        Swal.fire({ title: 'Error', icon: 'error', customClass: { popup: 'rounded-3xl', confirmButton: 'bg-rose-500 text-white px-6 py-2.5 rounded-xl' }, buttonsStyling: false });
      }
    });
  }

  deletePermission(perm: PermissionResponse) {
    Swal.fire({
      title: '¿Eliminar Permiso?',
      text: `¿Estás seguro de eliminar el permiso "${perm.permCode}"?`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-3xl',
        actions: 'gap-3',
        confirmButton: 'bg-rose-500 text-white px-6 py-2.5 rounded-xl',
        cancelButton: 'bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        this.roleService.deletePermission(perm.permissionId).subscribe({
          next: () => {
            this.loadData();
            Swal.fire({ title: '¡Eliminado!', icon: 'success', customClass: { popup: 'rounded-3xl', confirmButton: 'bg-corporate-primary text-white px-6 py-2.5 rounded-xl' }, buttonsStyling: false });
          },
          error: () => Swal.fire({ title: 'Error', text: 'No se pudo eliminar.', icon: 'error', customClass: { popup: 'rounded-3xl', confirmButton: 'bg-rose-500 text-white px-6 py-2.5 rounded-xl' }, buttonsStyling: false })
        });
      }
    });
  }
}
