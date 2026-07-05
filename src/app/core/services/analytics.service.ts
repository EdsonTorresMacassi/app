import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardMetrics {
  totalUsers: number;
  newUsersThisMonth: number;
  newUsersLastMonth: number;
  inactiveUsers: number;
  activeRoles: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/analytics`;

  getDashboardMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.API_URL}/dashboard`);
  }
}
