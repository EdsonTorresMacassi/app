import { Component, EventEmitter, OnInit, Output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService, CreateUserRequest } from '../../../core/services/user.service';
import { RoleService, RoleResponse } from '../../../core/services/role.service';
import { CatalogService, CatalogItem } from '../../../core/services/catalog.service';
import { InputComponent } from '@shared/components/form/input/input.component';
import { SelectComponent, SelectOption } from '@shared/components/form/select/select.component';
import { DatetimePickerComponent } from '@shared/components/form/datetime-picker/datetime-picker.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-create-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, SelectComponent, DatetimePickerComponent, ButtonComponent],
  templateUrl: './create-user-form.component.html'
})
export class CreateUserFormComponent implements OnInit {
  @Output() onSuccess = new EventEmitter<void>();
  @Output() onCancel  = new EventEmitter<void>();

  private fb             = inject(FormBuilder);
  private userService    = inject(UserService);
  private roleService    = inject(RoleService);
  private catalogService = inject(CatalogService);
  private toastService   = inject(ToastService);

  isLoading  = signal(false);
  showPwd    = signal(false);
  error      = signal<string | null>(null);
  roles      = signal<RoleResponse[]>([]);
  docTypes   = signal<CatalogItem[]>([]);
  genders    = signal<CatalogItem[]>([]);
  nationalities = signal<CatalogItem[]>([]);

  // Computed options para <app-select>
  roleOptions = computed<SelectOption[]>(() => 
    this.roles().map(r => ({ label: r.roleName, value: r.roleName }))
  );
  docTypeOptions = computed<SelectOption[]>(() => 
    this.docTypes().map(c => ({ label: c.name, value: c.catalogId }))
  );
  genderOptions = computed<SelectOption[]>(() => 
    this.genders().map(c => ({ label: c.name, value: c.catalogId }))
  );
  nationalityOptions = computed<SelectOption[]>(() => 
    this.nationalities().map(c => ({ label: c.name, value: c.catalogId }))
  );

  form = this.fb.nonNullable.group({
    firstName:       ['', [Validators.required, Validators.minLength(2)]],
    lastName:        ['', [Validators.required, Validators.minLength(2)]],
    secondLastName:  [''],
    email:           ['', [Validators.required, Validators.email]],
    username:        ['', [Validators.required, Validators.minLength(3)]],
    password:        ['', [Validators.required, Validators.minLength(8),
                           Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
    confirmPassword: ['', [Validators.required]],
    docType:         ['', Validators.required],
    docNumber:       ['', Validators.required],
    gender:          [''],
    birthDate:       [''],
    address:         [''],
    phone:           [''],
    nationality:     [''],
    roleName:        ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  private passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  ngOnInit() {
    this.catalogService.getActiveCatalogsByType('DOC_TYPE').subscribe(data => this.docTypes.set(data));
    this.catalogService.getActiveCatalogsByType('GENDER').subscribe(data => this.genders.set(data));
    this.catalogService.getActiveCatalogsByType('COUNTRY').subscribe(data => this.nationalities.set(data));

    this.roleService.findAll().subscribe({
      next: roles => this.roles.set(roles),
      error: () => this.error.set('No se pudieron cargar los roles disponibles.')
    });
  }

  // Password validators visuales reactivos (se actualizan en cada cambio del formulario)
  get passwordValue() { return this.form.controls.password.value || ''; }
  get hasLength() { return this.passwordValue.length >= 8; }
  get hasUpper() { return /[A-Z]/.test(this.passwordValue); }
  get hasNumber() { return /\d/.test(this.passwordValue); }

  togglePwd() { this.showPwd.update(v => !v); }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.error.set(null);

    const payload = this.form.getRawValue() as CreateUserRequest;

    this.userService.create(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.onSuccess.emit();
      },
      error: (err) => {
        this.isLoading.set(false);
        const errorMessage = err.error?.message || 'Error interno del servidor. Intenta nuevamente.';

        if (err.status === 409 || err.status === 400) {
          this.toastService.warning(errorMessage);
        } else {
          this.toastService.error(errorMessage);
        }
      }
    });
  }
}
