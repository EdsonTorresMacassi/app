export interface PersonDTO {
  firstName: string;
  lastName: string;
  secondLastName?: string;
  docType?: string;
  docNumber?: string;
  email: string;
  phone?: string;
}

export interface UserDTO {
  userId: string;
  username: string;
  roles: string[];
  permissions: string[];
  person: PersonDTO;
}

export interface MenuItemDTO {
  id: string;
  title: string;
  icon?: string;
  path?: string;
  menuType: 'MODULE' | 'SUBMODULE' | 'ITEM';
  children: MenuItemDTO[];
}

// Con Keycloak, accessToken y refreshToken vienen de Keycloak,
// no del backend. El backend solo devuelve el contexto de negocio.
export interface AuthResponse {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserDTO;
  navigationMenu: MenuItemDTO[];
  needsProfileCompletion: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  timestamp: string;
  traceId: string;
  data: T;
}
