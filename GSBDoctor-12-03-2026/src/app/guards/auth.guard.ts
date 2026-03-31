import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * Guard pour protéger les routes nécessitant une authentification
 * Redirige vers /login si non connecté
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier si l'utilisateur est authentifié
  if (authService.isAuthenticated()) {
    return true;  // Autoriser l'accès
  }

  // Sinon, rediriger vers la page de connexion
  router.navigate(['/login']);
  return false;  // Bloquer l'accès
};