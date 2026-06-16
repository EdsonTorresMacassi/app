import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CellContext } from '@tanstack/angular-table';
@Component({
  selector: 'app-grid-datetime-cell',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-w-[170px]">
      <input type="date"
        [ngModel]="dateValue"
        (ngModelChange)="updateValue($event)"
        class="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-sm outline-none"
      />
    </div>
  `,
})
export class GridDatetimeCellComponent {
  readonly context = input.required<CellContext<any, Date | null>>();

  get dateValue(): string {
    const d = this.context().getValue();
    if (!d) return '';
    return d instanceof Date ? d.toISOString().split('T')[0] : String(d).split('T')[0];
  }

  updateValue(nextValue: string): void {
    const row = this.context().row.original as { dueDate?: Date | null };
    row.dueDate = nextValue ? new Date(nextValue) : null;
  }
}
