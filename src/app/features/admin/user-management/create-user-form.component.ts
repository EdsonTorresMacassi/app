import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService, CreateUserRequest } from '../../../core/services/user.service';
import { RoleService, RoleResponse } from '../../../core/services/role.service';

@Component({
  selector: 'app-create-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-user-form.component.html'
})
export class CreateUserFormComponent implements OnInit {
  @Output() onSuccess = new EventEmitter<void>();
  @Output() onCancel  = new EventEmitter<void>();

  private fb          = inject(FormBuilder);
  private userService = inject(UserService);
  private roleService = inject(RoleService);

  isLoading  = signal(false);
  showPwd    = signal(false);
  error      = signal<string | null>(null);
  roles      = signal<RoleResponse[]>([]);

  form = this.fb.nonNullable.group({
    firstName:       ['', [Validators.required, Validators.minLength(2)]],
    lastName:        ['', [Validators.required, Validators.minLength(2)]],
    secondLastName:  [''],
    email:           ['', [Validators.required, Validators.email]],
    username:        ['', [Validators.required, Validators.minLength(3)]],
    password:        ['', [Validators.required, Validators.minLength(8),
                           Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
    docType:         ['', Validators.required],
    docNumber:       ['', Validators.required],
    phone:           [''],
    nationality:     [''],
    roleName:        ['', Validators.required]
  });

  ngOnInit() {
    this.roleService.findAll().subscribe({
      next: roles => this.roles.set(roles),
      error: () => this.error.set('No se pudieron cargar los roles disponibles.')
    });
  }

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
        if (err.status === 409) {
          this.error.set('El username o email ya existe en el sistema.');
        } else if (err.status === 400) {
          this.error.set('Datos inválidos. Revisa los campos e intenta nuevamente.');
        } else {
          this.error.set('Error del servidor. Intenta nuevamente.');
        }
      }
    });
  }
}
