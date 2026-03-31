import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

/**
 * Intercepteur HTTP qui ajoute automatiquement le ticket
 * à toutes les requêtes sortantes
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Récupérer le ticket actuel
  const ticket = authService.getTicket();

  // Cloner la requête et ajouter le ticket en Bearer uniquement pour l'API
  let modifiedReq = req;

  if (ticket && req.url.startsWith('http://localhost:3000')) {
    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${ticket}`,
      },
    });
  }

  // Envoyer la requête et gérer les erreurs
  return next(modifiedReq).pipe(
    catchError((error) => {
      // Si erreur 401 (Non autorisé), déconnecter l'utilisateur
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }

      // Relancer l'erreur pour la propagation
      return throwError(() => error);
    }),
  );
};
