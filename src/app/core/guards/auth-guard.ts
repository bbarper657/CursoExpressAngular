import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {

  // Inyecta servicio de autenticacion
  const authService = inject(AuthService);

  // Verifica si el usuario tiene token valido
  const token = authService.getToken();
  if (token) {
    return true; // Permite la navegación si el token existe
  }

  // Redirige al login si no hay token
  const router = inject(Router);
  router.navigate(['/forbidden']); // Redirige a 403
  return false; // Bloquea navegación
};
