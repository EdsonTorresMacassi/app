import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AnalyticsService, DashboardMetrics } from '../../../core/services/analytics.service';

interface Kpi {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-analytics-report',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './analytics-report.component.html',
  styleUrl: './analytics-report.component.scss'
})
export class AnalyticsReportComponent implements OnInit {
  private authService = inject(AuthService);
  private analyticsService = inject(AnalyticsService);
  
  currentUser = this.authService.currentUser;
  
  isLoading = signal<boolean>(true);
  kpis = signal<Kpi[]>([]);

  ngOnInit(): void {
    this.analyticsService.getDashboardMetrics().subscribe({
      next: (metrics) => {
        this.kpis.set(this.buildKpis(metrics));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching dashboard metrics', err);
        this.isLoading.set(false);
      }
    });
  }

  private buildKpis(metrics: DashboardMetrics): Kpi[] {
    // Calcular porcentaje de nuevos usuarios (mes actual vs anterior)
    let newUsersChange = 0;
    if (metrics.newUsersLastMonth === 0) {
      newUsersChange = metrics.newUsersThisMonth > 0 ? 100 : 0;
    } else {
      newUsersChange = ((metrics.newUsersThisMonth - metrics.newUsersLastMonth) / metrics.newUsersLastMonth) * 100;
    }
    
    const newUsersChangeFormatted = newUsersChange >= 0 ? `+${newUsersChange.toFixed(1)}%` : `${newUsersChange.toFixed(1)}%`;
    const isNewUsersPositive = newUsersChange >= 0;

    return [
      {
        title: 'Usuarios Totales',
        value: metrics.totalUsers,
        change: 'Todos',
        isPositive: true,
        icon: 'fa-solid fa-users',
        color: 'blue'
      },
      {
        title: 'Nuevos Usuarios (Mes)',
        value: metrics.newUsersThisMonth,
        change: newUsersChangeFormatted,
        isPositive: isNewUsersPositive,
        icon: 'fa-solid fa-user-plus',
        color: 'emerald'
      },
      {
        title: 'Usuarios Inactivos',
        value: metrics.inactiveUsers,
        change: 'Atención',
        isPositive: metrics.inactiveUsers === 0,
        icon: 'fa-solid fa-user-xmark',
        color: 'rose'
      },
      {
        title: 'Roles Activos',
        value: metrics.activeRoles,
        change: 'Operativos',
        isPositive: true,
        icon: 'fa-solid fa-shield',
        color: 'indigo'
      }
    ];
  }
}
