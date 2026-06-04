import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-analytics-report',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './analytics-report.component.html',
  styleUrl: './analytics-report.component.scss'
})
export class AnalyticsReportComponent {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  kpis = [
    {
      title: 'Ingresos Totales',
      value: '$45,231.89',
      change: '+20.1%',
      isPositive: true,
      icon: 'fa-solid fa-dollar-sign',
      color: 'blue'
    },
    {
      title: 'Nuevos Usuarios',
      value: '2,350',
      change: '+180.1%',
      isPositive: true,
      icon: 'fa-solid fa-users',
      color: 'indigo'
    },
    {
      title: 'Tasa de Cancelación',
      value: '1.2%',
      change: '-0.1%',
      isPositive: true,
      icon: 'fa-solid fa-chart-line',
      color: 'rose'
    },
    {
      title: 'Usuarios Activos',
      value: '12,345',
      change: '+12.5%',
      isPositive: true,
      icon: 'fa-solid fa-circle-check',
      color: 'emerald'
    }
  ];
}
