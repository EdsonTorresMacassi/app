export interface UserResponse {
  personId: number;
  keycloakId: string;
  username: string;
  firstName: string;
  lastName: string;
  secondLastName?: string;
  email: string;
  phone?: string;
  docType?: string;
  docNumber?: string;
  gender?: string;
  birthDate?: string;
  address?: string;
  nationality?: string;
  status?: string;
  profileComplete: boolean;
  roles: string[];
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  secondLastName?: string;
  email: string;
  username: string;
  password: string;
  docType: string;
  docNumber: string;
  gender?: string;
  birthDate?: string;
  address?: string;
  phone?: string;
  nationality?: string;
  roleName: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  secondLastName?: string;
  phone?: string;
  nationality?: string;
  docType?: string;
  docNumber?: string;
  gender?: string;
  birthDate?: string;
  address?: string;
  roles?: string[];
}
