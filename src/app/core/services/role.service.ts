import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { RoleResponse, PermissionResponse, RoleRequest, PermissionRequest, AssignPermissionsRequest } from '../models/role/role.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/roles`;
  private readonly PERMS = `${environment.apiUrl}/permissions`;
  private readonly ADMIN_ROLES = `${environment.apiUrl}/admin/roles`;
  private readonly ADMIN_PERMS = `${environment.apiUrl}/admin/permissions`;

  findAll(): Observable<RoleResponse[]> {
    return this.http.get<ApiResponse<RoleResponse[]>>(this.BASE)
      .pipe(map(r => r.data));
  }

  createRole(req: RoleRequest): Observable<RoleResponse> {
    return this.http.post<ApiResponse<RoleResponse>>(this.ADMIN_ROLES, req)
      .pipe(map(r => r.data));
  }

  updateRole(id: number, req: RoleRequest): Observable<RoleResponse> {
    return this.http.put<ApiResponse<RoleResponse>>(`${this.ADMIN_ROLES}/${id}`, req)
      .pipe(map(r => r.data));
  }

  deleteRole(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.ADMIN_ROLES}/${id}`)
      .pipe(map(() => void 0));
  }

  findAllPermissions(): Observable<PermissionResponse[]> {
    return this.http.get<ApiResponse<PermissionResponse[]>>(this.PERMS)
      .pipe(map(r => r.data));
  }

  createPermission(req: PermissionRequest): Observable<PermissionResponse> {
    return this.http.post<ApiResponse<PermissionResponse>>(this.ADMIN_PERMS, req)
      .pipe(map(r => r.data));
  }

  updatePermission(id: number, req: PermissionRequest): Observable<PermissionResponse> {
    return this.http.put<ApiResponse<PermissionResponse>>(`${this.ADMIN_PERMS}/${id}`, req)
      .pipe(map(r => r.data));
  }

  deletePermission(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.ADMIN_PERMS}/${id}`)
      .pipe(map(() => void 0));
  }

  assignPermissions(roleId: number, req: AssignPermissionsRequest): Observable<RoleResponse> {
    return this.http.put<ApiResponse<RoleResponse>>(
      `${this.BASE}/${roleId}/permissions`, req
    ).pipe(map(r => r.data));
  }
}

