import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

/**
 * Composant de connexion
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  // Signals pour les champs du formulaire
  protected readonly username = signal('');
  protected readonly password = signal('');
  protected readonly isSubmitting = signal(false);

  // Injection des dépendances avec inject()
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /**
   * Gestion de la soumission du formulaire
   */
  onSubmit(): void {
    // Éviter les soumissions multiples
    if (this.isSubmitting() || !this.username() || !this.password()) {
      return;
    }

    this.isSubmitting.set(true);

    // Tentative de connexion
    this.authService
      .login({
        login: this.username(),
        password: this.password(),
      })
      .subscribe({
        next: (success: boolean) => {
          // Si succès, rediriger vers la liste des médecins
          if (success) {
            this.router.navigate(['/doctors']);
          }
          this.isSubmitting.set(false);
        },
        error: () => {
          // En cas d'erreur non gérée
          this.isSubmitting.set(false);
        },
      });
  }

  /**
   * Met à jour le signal username
   */
  updateUsername(value: string): void {
    this.username.set(value);
  }

  /**
   * Met à jour le signal password
   */
  updatePassword(value: string): void {
    this.password.set(value);
  }
}
