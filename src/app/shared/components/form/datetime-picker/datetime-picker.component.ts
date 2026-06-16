import {
  Component,
  ElementRef,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'app-datetime-picker',
  standalone: true,
  imports: [],
  templateUrl: './datetime-picker.component.html',
})
export class DatetimePickerComponent implements ControlValueAccessor {
  label = input<string>('');
  type = input<'date' | 'datetime-local' | 'time' | 'month'>('date');
  size = input<'sm' | 'md' | 'lg'>('md');
  hasError = input<boolean>(false);
  required = input<boolean>(false);
  
  min = input<string | undefined>(undefined);
  max = input<string | undefined>(undefined);

  valueChange = output<string>();
  blurChange = output<void>();

  private ngControl = inject(NgControl, {
    self: true,
    optional: true,
  });

  value = model<string>('');
  disabled = model<boolean>(false);

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  onChange = (value: string) => {};
  onTouched = () => {
    this.blurChange.emit();
  };

  writeValue(value: string): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  handleInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
  }

  get isInvalid(): boolean {
    const control = this.ngControl?.control;
    if (!control || !control.validator) return false;
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  get isRequired(): boolean {
    if (this.required()) return true;
    const control = this.ngControl?.control;
    if (!control || !control.validator) return false;
    const v = control.validator({} as any);
    return !!v?.['required'];
  }

  errorMessages = input<{ [key: string]: string }>({});

  get currentErrorMessage(): string | null {
    const control = this.ngControl?.control;
    if (!control || !control.invalid || !(control.touched || control.dirty)) {
      if (this.hasError()) {
        const customMessages = this.errorMessages();
        if (customMessages && customMessages['custom']) return customMessages['custom'];
        return 'Revisa este campo.';
      }
      return null;
    }
    
    if (control.errors) {
      const firstKey = Object.keys(control.errors)[0];
      const customMessages = this.errorMessages();
      
      if (customMessages && customMessages[firstKey]) {
        return customMessages[firstKey];
      }
      
      switch (firstKey) {
        case 'required': return 'Este campo es requerido.';
        default: return 'Fecha/hora inválida.';
      }
    }
    return null;
  }

  getInputClasses(): string {
    const baseClasses = `block w-full box-border border rounded-lg transition-colors outline-none
    bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white
    disabled:bg-slate-100 disabled:dark:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed 
    `;

    const stateClasses =
      this.isInvalid || this.hasError()
        ? 'border-rose-500 dark:border-rose-500'
        : 'border-slate-200 dark:border-slate-600 focus:border-corporate-primary';

    const sizeClasses = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-11 px-3 text-base',
      lg: 'h-13 px-4 text-lg',
    };

    return `${baseClasses} ${stateClasses} ${sizeClasses[this.size()]} px-3`;
  }
}
