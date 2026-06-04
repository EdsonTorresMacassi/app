import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredPermission: string = route.data['permission'];

  if (!requiredPermission || authService.hasPermission(requiredPermission)) {
    return true;
  }
  return router.parseUrl('/forbidden');
};
