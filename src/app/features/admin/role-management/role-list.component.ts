import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleService, RoleResponse, PermissionResponse } from '../../../core/services/role.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-list.component.html'
})
export class RoleListComponent implements OnInit {
  private roleService = inject(RoleService);
  authService = inject(AuthService);

  roles       = signal<RoleResponse[]>([]);
  allPerms    = signal<PermissionResponse[]>([]);
  isLoading   = signal(true);
  error       = signal<string | null>(null);
  expandedRole = signal<string | null>(null);

  // Agrupar permisos por módulo para mostrarlos organizados
  permsByModule = signal<Record<string, PermissionResponse[]>>({});

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
        // Agrupar por módulo
        const grouped = perms.reduce((acc, p) => {
          if (!acc[p.permModule]) acc[p.permModule] = [];
          acc[p.permModule].push(p);
          return acc;
        }, {} as Record<string, PermissionResponse[]>);
        this.permsByModule.set(grouped);
      }
    });
  }

  toggleRole(roleId: string) {
    this.expandedRole.update(curr => curr === roleId ? null : roleId);
  }

  hasPermission(role: RoleResponse, permCode: string | undefined): boolean {
    if (!permCode) return false;
    return role.permissions.some(p => p.permCode === permCode);
  }

  getModules(): string[] {
    return Object.keys(this.permsByModule());
  }
}
