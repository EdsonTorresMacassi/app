export interface RoleResponse {
  roleId: number;
  roleName: string;
  description: string;
  permissions: PermissionResponse[];
}

export interface PermissionResponse {
  permissionId: number;
  permCode: string;
  description: string;
  permModule: string;
}

export interface RoleRequest {
  roleName: string;
  description?: string;
  permissionIds?: number[];
}

export interface PermissionRequest {
  permCode: string;
  description?: string;
  permModule: string;
}

export interface AssignPermissionsRequest {
  permissionIds: number[];
}
