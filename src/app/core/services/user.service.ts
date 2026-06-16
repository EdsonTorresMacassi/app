import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';

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


@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/users`;

  findAll(): Observable<UserResponse[]> {
    return this.http.get<ApiResponse<UserResponse[]>>(this.BASE)
      .pipe(map(r => r.data));
  }

  findById(personId: number): Observable<UserResponse> {
    return this.http.get<ApiResponse<UserResponse>>(`${this.BASE}/${personId}`)
      .pipe(map(r => r.data));
  }

  create(payload: CreateUserRequest): Observable<UserResponse> {
    return this.http.post<ApiResponse<UserResponse>>(this.BASE, payload)
      .pipe(map(r => r.data));
  }

  update(personId: number, payload: UpdateUserRequest): Observable<UserResponse> {
    return this.http.put<ApiResponse<UserResponse>>(`${this.BASE}/${personId}`, payload)
      .pipe(map(r => r.data));
  }

  disable(personId: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${personId}`);
  }

  unlock(personId: number): Observable<void> {
    return this.http.post<void>(`${this.BASE}/${personId}/unlock`, {});
  }

  restore(personId: number): Observable<void> {
    return this.http.post<void>(`${this.BASE}/${personId}/restore`, {});
  }
}

