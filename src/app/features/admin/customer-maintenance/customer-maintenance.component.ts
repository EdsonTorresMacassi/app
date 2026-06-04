import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface UserRecord {
  id: string;
  email: string;
  roleName: string;
  firstName: string;
  lastName: string;
  accountStatus: 'ACTIVE' | 'DISABLED';
}

@Component({
  selector: 'app-customer-maintenance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-maintenance.component.html',
  styleUrl: './customer-maintenance.component.scss'
})
export class CustomerMaintenanceComponent {
  // Datos de ejemplo alineados con el modelo real del backend
  users = signal<UserRecord[]>([
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'sistema@empresa.com',
      roleName: 'ADMIN',
      firstName: 'Administrador',
      lastName: 'Sistema',
      accountStatus: 'ACTIVE'
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'operador@empresa.com',
      roleName: 'OPERATOR',
      firstName: 'Juan',
      lastName: 'Pérez',
      accountStatus: 'ACTIVE'
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      email: 'viewer@empresa.com',
      roleName: 'VIEWER',
      firstName: 'María',
      lastName: 'García',
      accountStatus: 'DISABLED'
    }
  ]);
}
