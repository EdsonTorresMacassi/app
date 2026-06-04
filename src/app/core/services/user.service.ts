import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UserResponse {
  personId: string;
  keycloakSub: string;
  username: string;
  firstName: string;
  lastName: string;
  secondLastName?: string;
  email: string;
  phone?: string;
  docType?: string;
  docNumber?: string;
  nationality?: string;
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
}

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/users`;

  findAll(): Observable<UserResponse[]> {
    return this.http.get<ApiResponse<UserResponse[]>>(this.BASE)
      .pipe(map(r => r.data));
  }

  findById(personId: string): Observable<UserResponse> {
    return this.http.get<ApiResponse<UserResponse>>(`${this.BASE}/${personId}`)
      .pipe(map(r => r.data));
  }

  create(payload: CreateUserRequest): Observable<UserResponse> {
    return this.http.post<ApiResponse<UserResponse>>(this.BASE, payload)
      .pipe(map(r => r.data));
  }

  update(personId: string, payload: UpdateUserRequest): Observable<UserResponse> {
    return this.http.put<ApiResponse<UserResponse>>(`${this.BASE}/${personId}`, payload)
      .pipe(map(r => r.data));
  }

  disable(personId: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${personId}`);
  }
}
