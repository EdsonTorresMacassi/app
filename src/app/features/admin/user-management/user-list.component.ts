import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService, UserResponse } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreateUserFormComponent } from './create-user-form.component';
import { EditUserFormComponent } from './edit-user-form.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CreateUserFormComponent, EditUserFormComponent],
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  authService = inject(AuthService);

  users = signal<UserResponse[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  searchQuery = signal('');
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDisableModal = signal(false);
  selectedUser = signal<UserResponse | null>(null);
  selectedUserForEdit = signal<string | null>(null);

  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.users().filter(u =>
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q)  ||
      u.email.toLowerCase().includes(q)     ||
      u.username.toLowerCase().includes(q)
    );
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.error.set(null);
    this.userService.findAll().subscribe({
      next: users => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los usuarios. Intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal() { this.showCreateModal.set(true); }
  closeCreateModal() { this.showCreateModal.set(false); }

  openEditModal(user: UserResponse) {
    this.selectedUserForEdit.set(user.personId);
    this.showEditModal.set(true);
  }
  closeEditModal() {
    this.selectedUserForEdit.set(null);
    this.showEditModal.set(false);
  }

  openDisableModal(user: UserResponse) {
    this.selectedUser.set(user);
    this.showDisableModal.set(true);
  }
  closeDisableModal() {
    this.selectedUser.set(null);
    this.showDisableModal.set(false);
  }

  confirmDisable() {
    const user = this.selectedUser();
    if (!user) return;
    this.userService.disable(user.personId).subscribe({
      next: () => {
        this.closeDisableModal();
        this.loadUsers();
      },
      error: () => this.error.set('Error al deshabilitar el usuario.')
    });
  }

  onUserCreated() {
    this.closeCreateModal();
    this.loadUsers();
  }

  onUserEdited() {
    this.closeEditModal();
    this.loadUsers();
  }
}
