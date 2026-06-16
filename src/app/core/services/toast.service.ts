import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  success(title: string) {
    this.Toast.fire({
      icon: 'success',
      title: title
    });
  }

  error(title: string) {
    this.Toast.fire({
      icon: 'error',
      title: title
    });
  }

  warning(title: string) {
    this.Toast.fire({
      icon: 'warning',
      title: title
    });
  }

  info(title: string) {
    this.Toast.fire({
      icon: 'info',
      title: title
    });
  }
}
