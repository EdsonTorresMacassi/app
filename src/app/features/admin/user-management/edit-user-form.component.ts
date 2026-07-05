import { Component, EventEmitter, Input, OnInit, Output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { UpdateUserRequest, UserResponse } from '../../../core/models/user/user.model';
import { CatalogService } from '../../../core/services/catalog.service';
import { CatalogItem } from '../../../core/models/catalog/catalog.model';
import { RoleService } from '../../../core/services/role.service';
import { RoleResponse } from '../../../core/models/role/role.model';
import { InputComponent } from '@shared/components/form/input/input.component';
import { SelectComponent, SelectOption } from '@shared/components/form/select/select.component';
import { DatetimePickerComponent } from '@shared/components/form/datetime-picker/datetime-picker.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-edit-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, SelectComponent, DatetimePickerComponent, ButtonComponent],
  templateUrl: './edit-user-form.component.html'
})
export class EditUserFormComponent implements OnInit {
  @Input({ required: true }) personId!: number;
  @Output() onSuccess = new EventEmitter<void>();
  @Output() onCancel  = new EventEmitter<void>();

  private fb          = inject(FormBuilder);
  private userService = inject(UserService);
  private catalogService = inject(CatalogService);
  private roleService = inject(RoleService);
  private toastService   = inject(ToastService);

  isLoading  = signal(true);
  isSaving   = signal(false);
  error      = signal<string | null>(null);

  docTypes = signal<CatalogItem[]>([]);
  genders = signal<CatalogItem[]>([]);
  nationalities = signal<CatalogItem[]>([]);
  roles = signal<RoleResponse[]>([]);

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
    docType:         ['', Validators.required],
    docNumber:       ['', Validators.required],
    gender:          [''],
    birthDate:       [''],
    address:         [''],
    phone:           [''],
    nationality:     [''],
    roleName:        ['', Validators.required]
  });

  ngOnInit() {
    this.catalogService.getActiveCatalogsByType('DOC_TYPE').subscribe(data => this.docTypes.set(data));
    this.catalogService.getActiveCatalogsByType('GENDER').subscribe(data => this.genders.set(data));
    this.catalogService.getActiveCatalogsByType('COUNTRY').subscribe(data => this.nationalities.set(data));
    this.roleService.findAll().subscribe({
      next: roles => this.roles.set(roles)
    });
    this.loadUser();
  }

  loadUser() {
    this.isLoading.set(true);
    this.userService.findById(this.personId).subscribe({
      next: (user: UserResponse) => {
        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          secondLastName: user.secondLastName || '',
          docType: user.docType || '',
          docNumber: user.docNumber || '',
          gender: user.gender || '',
          birthDate: user.birthDate || '',
          address: user.address || '',
          phone: user.phone || '',
          nationality: user.nationality || '',
          roleName: user.roles && user.roles.length > 0 ? user.roles[0] : ''
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la información del usuario.');
        this.isLoading.set(false);
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    this.error.set(null);

    const formValue = this.form.getRawValue();
    const payload: UpdateUserRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      secondLastName: formValue.secondLastName,
      docType: formValue.docType,
      docNumber: formValue.docNumber,
      gender: formValue.gender,
      birthDate: formValue.birthDate,
      address: formValue.address,
      phone: formValue.phone,
      nationality: formValue.nationality,
      roles: formValue.roleName ? [formValue.roleName] : []
    };

    this.userService.update(this.personId, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.onSuccess.emit();
      },
      error: (err) => {
        this.isSaving.set(false);
        const errorMessage = err.error?.message || 'Error al actualizar los datos. Intenta nuevamente.';

        if (err.status === 409 || err.status === 400) {
          this.toastService.warning(errorMessage);
        } else {
          this.toastService.error(errorMessage);
        }
      }
    });
  }
}

