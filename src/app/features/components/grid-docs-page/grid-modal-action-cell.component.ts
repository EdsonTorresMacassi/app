import { Component, input } from '@angular/core';
import { CellContext } from '@tanstack/angular-table';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-grid-modal-action-cell',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div class="flex justify-center">
      <app-button size="sm" variant="secondary" color="secondary" (clicked)="openModal()">
        Ver detalle
      </app-button>
    </div>
  `,
})
export class GridModalActionCellComponent {
  readonly context = input.required<CellContext<any, unknown>>();

  openModal(): void {
    const row = this.context().row.original as {
      task: string;
      owner: string;
      sprint: string;
      priority: string;
      alerts: number;
    };
    alert(`Ver detalle de: ${row.task} (Responsable: ${row.owner}, Sprint: ${row.sprint}, Prioridad: ${row.priority}, Alertas: ${row.alerts})`);
  }
}
