import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly nom = signal('');
  protected readonly prenom = signal('');
  protected readonly login = signal('');
  protected readonly password = signal('');
  protected readonly adresse = signal('');
  protected readonly cp = signal('');
  protected readonly ville = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly successMessage = signal<string | null>(null);

  onSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.successMessage.set(null);

    this.authService
      .register({
        nom: this.nom(),
        prenom: this.prenom(),
        login: this.login(),
        password: this.password(),
        adresse: this.adresse(),
        cp: this.cp(),
        ville: this.ville(),
      })
      .subscribe({
        next: (ok) => {
          this.isSubmitting.set(false);
          if (!ok) {
            return;
          }

          this.successMessage.set('Inscription reussie. Connectez-vous avec votre nouveau compte.');
          setTimeout(() => this.router.navigate(['/login']), 1100);
        },
        error: () => {
          this.isSubmitting.set(false);
        },
      });
  }
}
