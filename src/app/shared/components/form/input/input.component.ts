import {
  AfterContentInit,
  Component,
  ContentChild,
  ElementRef,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class InputComponent implements ControlValueAccessor, AfterContentInit {
  // Inputs v19 (Signals)
  label = input<string>('');
  placeholder = input<string>('');
  type = input<string>('text');
  autocomplete = input<string>('off');
  size = input<'sm' | 'md' | 'lg'>('md');
  hasError = input<boolean>(false);
  required = input<boolean>(false);

  // Output v19 (Nueva API de eventos)
  valueChange = output<string>();
  blurChange = output<void>();

  private ngControl = inject(NgControl, {
    self: true,
    optional: true,
  });

  // Detecta si hay iconos proyectados
  @ContentChild('leftIcon', { read: ElementRef }) leftIconRef?: ElementRef;
  @ContentChild('rightIcon', { read: ElementRef }) rightIconRef?: ElementRef;

  hasLeftIcon = false;
  hasRightIcon = false;

  value = model<string>('');
  disabled = model<boolean>(false);

  constructor(
    public elementRef: ElementRef, // Necesario para Datetimepicker (wrapper)
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  onChange = (value: string) => {};
  onTouched = () => {
    this.blurChange.emit();
  };

  ngAfterContentInit() {
    this.hasLeftIcon = !!this.leftIconRef;
    this.hasRightIcon = !!this.rightIconRef;
  }

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
      // También podemos forzar el error de afuera con hasError()
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
      
      // Fallbacks
      switch (firstKey) {
        case 'required': return 'Este campo es requerido.';
        case 'email': return 'Formato de correo inválido.';
        case 'minlength': return `Mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
        case 'mismatch': return 'Las contraseñas no coinciden.';
        default: return 'Valor inválido.';
      }
    }
    return null;
  }

  getInputClasses(): string {
    const baseClasses = `block w-full box-border border rounded-lg transition-colors outline-none
    bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white
    disabled:bg-slate-100 disabled:dark:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed 
    placeholder:text-slate-400 dark:placeholder:text-slate-500
    `;

    const stateClasses =
      this.isInvalid || this.hasError()
        ? 'border-rose-500 dark:border-rose-500'
        : 'border-slate-200 dark:border-slate-600 focus:border-corporate-primary';

    // Clases de tamaño
    const sizeClasses = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-11 px-3 text-base',
      lg: 'h-13 px-4 text-lg',
    };

    // Padding según iconos y tamaño
    let paddingClasses = '';
    if (this.hasLeftIcon && this.hasRightIcon) {
      paddingClasses =
        this.size() === 'sm'
          ? 'pl-9 pr-9'
          : this.size() === 'lg'
            ? 'pl-12 pr-12'
            : 'pl-10 pr-10';
    } else if (this.hasLeftIcon) {
      paddingClasses =
        this.size() === 'sm'
          ? 'pl-9 pr-3'
          : this.size() === 'lg'
            ? 'pl-12 pr-3'
            : 'pl-10 pr-3';
    } else if (this.hasRightIcon) {
      paddingClasses =
        this.size() === 'sm'
          ? 'pr-9 pl-3'
          : this.size() === 'lg'
            ? 'pr-12 pl-4'
            : 'pr-10 pl-3';
    } else {
      paddingClasses = 'px-3';
    }

    return `${baseClasses} ${stateClasses} ${sizeClasses[this.size()]} ${paddingClasses}`;
  }
}
