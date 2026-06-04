import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex min-h-screen items-center justify-center
                bg-slate-50 dark:bg-slate-900 px-4">
      <div class="w-full max-w-lg">
        <!-- Header -->
        <div class="mb-8 text-center">
          <div class="mx-auto mb-4 w-16 h-16 bg-corporate-primary/10 rounded-2xl
                      flex items-center justify-center">
            <i class="fa-solid fa-user-pen text-2xl text-corporate-primary"></i>
          </div>
          <h1 class="text-2xl font-bold text-slate-800 dark:text-white font-heading">
            Completa tu perfil
          </h1>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Para continuar necesitamos algunos datos adicionales.
          </p>
        </div>

        <!-- Card -->
        <div class="rounded-2xl bg-white dark:bg-slate-800 shadow-sm
                    border border-slate-200 dark:border-slate-700 p-8">
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-5">

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-slate-700
                              dark:text-slate-300 mb-2">
                  Nombres *
                </label>
                <input formControlName="firstName" type="text"
                       placeholder="Nombres"
                       class="w-full rounded-lg border border-slate-200
                              dark:border-slate-600 bg-slate-50 dark:bg-slate-700
                              px-4 py-3 text-sm text-slate-800 dark:text-white
                              outline-none focus:border-corporate-primary
                              focus:ring-2 focus:ring-corporate-primary/20 transition-all" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700
                              dark:text-slate-300 mb-2">
                  Apellidos *
                </label>
                <input formControlName="lastName" type="text"
                       placeholder="Apellidos"
                       class="w-full rounded-lg border border-slate-200
                              dark:border-slate-600 bg-slate-50 dark:bg-slate-700
                              px-4 py-3 text-sm text-slate-800 dark:text-white
                              outline-none focus:border-corporate-primary
                              focus:ring-2 focus:ring-corporate-primary/20 transition-all" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-slate-700
                              dark:text-slate-300 mb-2">
                  Tipo de documento *
                </label>
                <select formControlName="docType"
                        class="w-full rounded-lg border border-slate-200
                               dark:border-slate-600 bg-slate-50 dark:bg-slate-700
                               px-4 py-3 text-sm text-slate-800 dark:text-white
                               outline-none focus:border-corporate-primary transition-all">
                  <option value="">Seleccionar...</option>
                  <option value="CI">Cédula</option>
                  <option value="RIF">RIF</option>
                  <option value="PASSPORT">Pasaporte</option>
                  <option value="DNI">DNI</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700
                              dark:text-slate-300 mb-2">
                  Número de documento *
                </label>
                <input formControlName="docNumber" type="text"
                       placeholder="Ej: V-12345678"
                       class="w-full rounded-lg border border-slate-200
                              dark:border-slate-600 bg-slate-50 dark:bg-slate-700
                              px-4 py-3 text-sm text-slate-800 dark:text-white
                              outline-none focus:border-corporate-primary
                              focus:ring-2 focus:ring-corporate-primary/20 transition-all" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700
                            dark:text-slate-300 mb-2">
                Teléfono
              </label>
              <input formControlName="phone" type="tel"
                     placeholder="+58 412 000 0000"
                     class="w-full rounded-lg border border-slate-200
                            dark:border-slate-600 bg-slate-50 dark:bg-slate-700
                            px-4 py-3 text-sm text-slate-800 dark:text-white
                            outline-none focus:border-corporate-primary
                            focus:ring-2 focus:ring-corporate-primary/20 transition-all" />
            </div>

            <!-- Error global -->
            <div *ngIf="errorMessage()"
                 class="flex items-center gap-2 rounded-lg bg-rose-50
                        dark:bg-rose-900/20 border border-rose-200 p-3">
              <i class="fa-solid fa-triangle-exclamation text-rose-500 text-sm"></i>
              <span class="text-sm text-rose-700 dark:text-rose-400">
                {{ errorMessage() }}
              </span>
            </div>

            <button type="submit" [disabled]="isLoading() || profileForm.invalid"
                    class="w-full flex items-center justify-center gap-2 rounded-lg
                           bg-corporate-primary py-3.5 font-semibold text-white text-sm
                           transition-all hover:bg-opacity-90 hover:shadow-lg
                           disabled:opacity-60 disabled:cursor-not-allowed">
              <svg *ngIf="isLoading()" class="h-4 w-4 animate-spin"
                   viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <i *ngIf="!isLoading()" class="fa-solid fa-check text-sm"></i>
              {{ isLoading() ? 'Guardando...' : 'Completar perfil' }}
            </button>

          </form>
        </div>
      </div>
    </div>
  `
})
export class CompleteProfileComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  profileForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', [Validators.required, Validators.minLength(2)]],
    docType:   ['', Validators.required],
    docNumber: ['', Validators.required],
    phone:     ['']
  });

  onSubmit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.http.put(`${environment.apiUrl}/persons/me`, this.profileForm.getRawValue())
      .subscribe({
        next: () => {
          this.authService.loadBusinessContext().subscribe({
            next: () => this.router.navigate(['/dashboard']),
            error: () => this.router.navigate(['/dashboard'])
          });
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('Error al guardar el perfil. Intenta nuevamente.');
        }
      });
  }
}
