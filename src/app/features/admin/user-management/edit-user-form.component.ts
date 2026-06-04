import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService, UpdateUserRequest, UserResponse } from '../../../core/services/user.service';

@Component({
  selector: 'app-edit-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-user-form.component.html'
})
export class EditUserFormComponent implements OnInit {
  @Input({ required: true }) personId!: string;
  @Output() onSuccess = new EventEmitter<void>();
  @Output() onCancel  = new EventEmitter<void>();

  private fb          = inject(FormBuilder);
  private userService = inject(UserService);

  isLoading  = signal(true);
  isSaving   = signal(false);
  error      = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    firstName:       ['', [Validators.required, Validators.minLength(2)]],
    lastName:        ['', [Validators.required, Validators.minLength(2)]],
    secondLastName:  [''],
    docType:         ['', Validators.required],
    docNumber:       ['', Validators.required],
    phone:           [''],
    nationality:     ['']
  });

  ngOnInit() {
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
          phone: user.phone || '',
          nationality: user.nationality || ''
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

    const payload = this.form.getRawValue() as UpdateUserRequest;

    this.userService.update(this.personId, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.onSuccess.emit();
      },
      error: () => {
        this.isSaving.set(false);
        this.error.set('Error al actualizar los datos. Intenta nuevamente.');
      }
    });
  }
}
