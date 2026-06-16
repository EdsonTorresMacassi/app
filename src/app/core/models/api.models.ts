/**
 * Modelos centralizados para la API del backend.
 * ÚNICA fuente de verdad — todos los servicios importan desde aquí.
 * Elimina las definiciones duplicadas en auth-response.interface.ts y user.interface.ts
 */

/** Wrapper estándar de respuesta del backend. */
export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  timestamp: string;
  traceId: string | null;
  data: T;
}

/** Datos personales del usuario. */
export interface PersonData {
  firstName: string;
  lastName: string;
  secondLastName: string | null;
  docType: number | null;
  docNumber: string | null;
  email: string;
  phone: string | null;
}

/** Contexto de usuario autenticado desde Oracle (roles, permisos, info personal). */
export interface UserContext {
  userId: number;
  username: string;
  roles: string[];
  permissions: string[];
  person: PersonData | null;
}

/** Ítem del menú de navegación (árbol jerárquico). */
export interface MenuItem {
  id: number;
  title: string;
  icon: string | null;
  navPath: string;       // Alineado con MenuItemDTO.navPath del backend
  menuType: string | null;
  children: MenuItem[];
}

/** Respuesta de autenticación y contexto de negocio. */
export interface AuthResponse {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserContext;
  navigationMenu: MenuItem[];
  needsProfileCompletion: boolean;
}

/** Respuesta paginada genérica. */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/**
 * User del estado local de la app (Signal en AuthService).
 * Subconjunto de UserContext almacenado en memoria (no localStorage).
 */
export interface User {
  userId: number;
  username: string;
  roles: string[];
  permissions: string[];
  person: PersonData | null;
}
