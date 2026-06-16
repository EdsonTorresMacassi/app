import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CatalogService, CatalogItem } from '../../core/services/catalog.service';
import { environment } from '../../../environments/environment';
import { InputComponent } from '@shared/components/form/input/input.component';
import { SelectComponent, SelectOption } from '@shared/components/form/select/select.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, SelectComponent, ButtonComponent],
  template: `
    <div class="flex min-h-screen items-center justify-center
                bg-slate-50 dark:bg-slate-900 px-4 py-8">
      <div class="w-full max-w-lg">

        <!-- Header -->
        <div class="mb-8 text-center">
          <div class="mx-auto mb-4 w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl
                      flex items-center justify-center shadow-sm">
            <i class="fa-solid fa-user-pen text-2xl text-blue-600 dark:text-blue-400"></i>
          </div>
          <h1 class="text-2xl font-bold text-slate-800 dark:text-white">
            Completa tu perfil
          </h1>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Para continuar necesitamos algunos datos adicionales.
          </p>
        </div>

        <!-- Info Banner -->
        <div class="mb-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100
                    dark:border-blue-800/50 p-4 flex gap-3 items-start">
          <i class="fa-solid fa-circle-info text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0"></i>
          <div>
            <p class="text-sm font-semibold text-blue-800 dark:text-blue-300">Verifica tus datos</p>
            <p class="text-sm text-blue-700 dark:text-blue-400 mt-0.5">
              Hemos pre-cargado la información de tu cuenta. Por favor verifica y
              corrige cualquier error antes de continuar.
            </p>
          </div>
        </div>

        <!-- Card -->
        <div class="rounded-2xl bg-white dark:bg-slate-800 shadow-lg
                    border border-slate-200 dark:border-slate-700 p-8">
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-5">

            <!-- Nombres / Apellidos -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <app-input label="Nombres" formControlName="firstName" placeholder="Nombres" [required]="true"></app-input>
              </div>
              <div>
                <app-input label="Apellidos" formControlName="lastName" placeholder="Apellidos" [required]="true"></app-input>
              </div>
              <div class="col-span-2">
                <app-input label="Segundo apellido" formControlName="secondLastName" placeholder="Opcional"></app-input>
              </div>
            </div>

            <!-- Género / Fecha nacimiento -->
            <div class="grid grid-cols-2 gap-4">
              <div data-showcase-root>
                <app-select label="Género" formControlName="gender" [options]="genderOptions()" placeholder="Seleccionar..."></app-select>
              </div>
              <div>
                <app-input label="Fecha de nacimiento" formControlName="birthDate" type="date"></app-input>
              </div>
            </div>

            <!-- Tipo doc / Número doc -->
            <div class="grid grid-cols-2 gap-4">
              <div data-showcase-root>
                <app-select label="Tipo de documento" formControlName="docType" [options]="docTypeOptions()" placeholder="Seleccionar..." [required]="true"></app-select>
              </div>
              <div>
                <app-input label="Número de documento" formControlName="docNumber" placeholder="Ej: 12345678" [required]="true"></app-input>
              </div>
            </div>

            <!-- Teléfono / Dirección -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <app-input label="Teléfono" formControlName="phone" placeholder="+58 412 000 0000"></app-input>
              </div>
              <div>
                <app-input label="Dirección" formControlName="address" placeholder="Dirección completa"></app-input>
              </div>
            </div>

            <!-- Nacionalidad -->
            <div data-showcase-root>
              <app-select label="Nacionalidad / País" formControlName="nationality" [options]="nationalityOptions()" [searchable]="true" placeholder="Buscar país..."></app-select>
            </div>

            <!-- Error global -->
            <div *ngIf="errorMessage()"
                 class="flex items-center gap-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/20
                        border border-rose-200 dark:border-rose-800 p-3.5 mt-2">
              <i class="fa-solid fa-triangle-exclamation text-rose-500 text-sm flex-shrink-0"></i>
              <span class="text-sm text-rose-700 dark:text-rose-400">{{ errorMessage() }}</span>
            </div>

            <!-- Submit -->
            <div class="pt-2">
              <app-button variant="primary" [fullWidth]="true" [loading]="isLoading()" (click)="onSubmit()">
                <i *ngIf="!isLoading()" leftIcon class="fa-solid fa-check text-sm"></i>
                Completar perfil
              </app-button>
            </div>

          </form>
        </div>

        <p class="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          Esta información es necesaria para el acceso al sistema.
        </p>
      </div>
    </div>
  `
})
export class CompleteProfileComponent implements OnInit {
  private fb             = inject(FormBuilder);
  private http           = inject(HttpClient);
  private router         = inject(Router);
  private authService    = inject(AuthService);
  private catalogService = inject(CatalogService);
  private toastService   = inject(ToastService);

  isLoading    = signal(false);
  errorMessage = signal<string | null>(null);

  docTypes     = signal<CatalogItem[]>([]);
  genders      = signal<CatalogItem[]>([]);
  nationalities = signal<CatalogItem[]>([]);

  // Computed options para <app-select>
  docTypeOptions = computed<SelectOption[]>(() => 
    this.docTypes().map(c => ({ label: c.name, value: c.catalogId }))
  );
  genderOptions = computed<SelectOption[]>(() => 
    this.genders().map(c => ({ label: c.name, value: c.catalogId }))
  );
  nationalityOptions = computed<SelectOption[]>(() => 
    this.nationalities().map(c => ({ label: c.name, value: c.catalogId }))
  );

  profileForm = this.fb.nonNullable.group({
    firstName:     ['', [Validators.required, Validators.minLength(2)]],
    lastName:      ['', [Validators.required, Validators.minLength(2)]],
    secondLastName: [''],
    docType:       ['', Validators.required],
    docNumber:     ['', Validators.required],
    gender:        [''],
    birthDate:     [''],
    address:       [''],
    phone:         [''],
    nationality:   ['']
  });

  ngOnInit() {
    this.catalogService.getActiveCatalogsByType('DOC_TYPE').subscribe(data => this.docTypes.set(data));
    this.catalogService.getActiveCatalogsByType('GENDER').subscribe(data => this.genders.set(data));
    this.catalogService.getActiveCatalogsByType('COUNTRY').subscribe(data => this.nationalities.set(data));

    const person = this.authService.currentUser()?.person;
    if (person) {
      this.profileForm.patchValue({
        firstName:     person.firstName || '',
        lastName:      person.lastName  || '',
        secondLastName: person.secondLastName || ''
      });
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.http.put(`${environment.apiUrl}/users/me/complete-profile`, this.profileForm.getRawValue())
      .subscribe({
        next: () => {
          this.authService.loadBusinessContext().subscribe({
            next:  () => this.router.navigate(['/dashboard']),
            error: () => this.router.navigate(['/dashboard'])
          });
        },
        error: (err) => {
          this.isLoading.set(false);
          const msg = err.error?.message || 'Error al guardar el perfil. Intenta nuevamente.';
          this.errorMessage.set(msg);
          
          if (err.status === 409 || err.status === 400) {
            this.toastService.warning(msg);
          } else {
            this.toastService.error(msg);
          }
        }
      });
  }
}
