import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CellContext } from '@tanstack/angular-table';
@Component({
  selector: 'app-grid-checkbox-cell',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex justify-center">
      <input type="checkbox"
        [ngModel]="checked"
        (ngModelChange)="updateChecked($event)"
        class="w-4 h-4 rounded border-slate-300 text-corporate-primary focus:ring-corporate-primary"
      />
    </div>
  `,
})
export class GridCheckboxCellComponent {
  readonly context = input.required<CellContext<any, boolean>>();

  get checked(): boolean {
    return !!this.context().getValue();
  }

  updateChecked(nextValue: boolean): void {
    const row = this.context().row.original as { done?: boolean };
    row.done = nextValue;
  }
}
