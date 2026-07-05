import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../models/api.models';
import { HttpUtils } from '../utils/http.utils';
import { UserResponse, CreateUserRequest, UpdateUserRequest } from '../models/user/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/users`;

  findAll(page: number = 0, size: number = 10, filters: any = {}): Observable<PageResponse<UserResponse>> {
    const params = HttpUtils.buildCleanParams({
      page,
      size,
      ...filters
    });

    return this.http.get<ApiResponse<PageResponse<UserResponse>>>(this.BASE, { params })
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

