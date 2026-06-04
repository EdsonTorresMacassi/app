import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from './user.service';

export interface RoleResponse {
  roleId: string;
  roleName: string;
  description: string;
  permissions: PermissionResponse[];
}

export interface PermissionResponse {
  permissionId: string;
  permCode: string;
  description: string;
  permModule: string;
}

export interface AssignPermissionsRequest {
  permissionIds: string[];
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/roles`;
  private readonly PERMS = `${environment.apiUrl}/permissions`;

  findAll(): Observable<RoleResponse[]> {
    return this.http.get<ApiResponse<RoleResponse[]>>(this.BASE)
      .pipe(map(r => r.data));
  }

  findAllPermissions(): Observable<PermissionResponse[]> {
    return this.http.get<ApiResponse<PermissionResponse[]>>(this.PERMS)
      .pipe(map(r => r.data));
  }

  assignPermissions(roleId: string, req: AssignPermissionsRequest): Observable<RoleResponse> {
    return this.http.put<ApiResponse<RoleResponse>>(
      `${this.BASE}/${roleId}/permissions`, req
    ).pipe(map(r => r.data));
  }
}
