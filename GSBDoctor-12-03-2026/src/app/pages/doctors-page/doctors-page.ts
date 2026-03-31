import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { DoctorsService } from '../../services/doctors.service';
import { AuthService } from '../../services/auth';
import { Doctor } from '../../types/doctor.interface';
import { Medecin } from '../../types/medecin.interface';
import { DoctorCard } from '../../components/doctor-card/doctor-card';
import { BehaviorSubject, switchMap } from 'rxjs';

@Component({
  selector: 'app-doctors-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DoctorCard, RouterLink],
  templateUrl: './doctors-page.html',
  styleUrls: ['./doctors-page.css'],
})
export class DoctorsPageComponent implements OnInit {
  private doctorsService = inject(DoctorsService);
  private authService = inject(AuthService);
  private router = inject(Router);

  private refreshTrigger$ = new BehaviorSubject(0);

  doctors = toSignal(this.refreshTrigger$.pipe(switchMap(() => this.doctorsService.getDoctors())), {
    initialValue: [] as Doctor[],
  });

  ngOnInit(): void {
    this.loadData();
  }

  // Form signals
  protected readonly nom = signal('');
  protected readonly prenom = signal('');
  protected readonly tel = signal('');
  protected readonly adresse = signal('');
  protected readonly specialitecomplementaire = signal('');
  protected readonly departement = signal('');

  protected readonly isSubmitting = signal(false);
  protected readonly pageMessage = signal<string | null>(null);
  protected readonly pageError = signal<string | null>(null);
  protected readonly editingDoctorId = signal<number | null>(null);

  // Confirmation signals
  protected readonly showDeleteConfirm = signal(false);
  protected readonly deleteConfirmDoctorId = signal<number | null>(null);
  protected readonly deleteConfirmDoctorName = signal<string>('');

  // Search term signal
  searchTerm = signal('');

  // Computed filtered doctors based on the search term
  filteredDoctors = computed(() => {
    const list = this.doctors();
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return list;
    return list.filter((d: Doctor) => {
      const fullName = (d.firstname + ' ' + d.lastname).toLowerCase();
      return (
        fullName.includes(term) ||
        (d.speciality || '').toLowerCase().includes(term) ||
        (d.email || '').toLowerCase().includes(term) ||
        (d.address || '').toLowerCase().includes(term)
      );
    });
  });

  loadData(): void {
    this.pageError.set(null);
    this.refreshTrigger$.next((this.refreshTrigger$.value || 0) + 1);
  }

  editDoctor(doctor: Doctor): void {
    this.editingDoctorId.set(doctor.id);
    this.nom.set(doctor.lastname || '');
    this.prenom.set(doctor.firstname || '');
    this.tel.set(doctor.phone || '');
    this.adresse.set(doctor.address || '');
    this.specialitecomplementaire.set(doctor.speciality || '');
    this.departement.set(doctor.department || '');
  }

  cancelEdit(): void {
    this.editingDoctorId.set(null);
    this.resetForm();
  }

  submit(): void {
    this.pageError.set(null);
    this.pageMessage.set(null);

    if (this.isSubmitting()) {
      console.warn('Already submitting, ignoring submit');
      return;
    }

    const nomVal = String(this.nom() || '').trim();
    const prenomVal = String(this.prenom() || '').trim();
    const telVal = String(this.tel() || '').trim();
    const adresseVal = String(this.adresse() || '').trim();
    const specialiteVal = String(this.specialitecomplementaire() || '').trim();
    const departementVal = String(this.departement() || '').trim();

    if (!nomVal || !prenomVal) {
      this.pageError.set('Le nom et le prenom sont requis.');
      console.warn('Validation failed: nom or prenom empty');
      return;
    }

    const doctorPayload: Medecin = {
      id: 0,
      nom: nomVal,
      prenom: prenomVal,
      tel: telVal,
      adresse: adresseVal,
      specialitecomplementaire: specialiteVal,
      departement: departementVal || undefined,
    };

    console.log('Submitting doctor payload:', doctorPayload);
    this.isSubmitting.set(true);

    const editingId = this.editingDoctorId();
    console.log('Editing ID:', editingId);

    const request = editingId
      ? this.doctorsService.updateDoctor(editingId, doctorPayload)
      : this.doctorsService.createDoctor(doctorPayload);

    request.subscribe({
      next: () => {
        console.log('Success: doctor saved');
        this.pageMessage.set(editingId ? 'Medecin mis a jour.' : 'Medecin cree.');
        this.isSubmitting.set(false);
        this.editingDoctorId.set(null);
        this.resetForm();
        this.loadData();
      },
      error: (err) => {
        console.error('Error saving doctor:', err);
        this.isSubmitting.set(false);
        const errorMsg = err?.error?.details || err?.error?.error || 'Operation impossible.';
        this.pageError.set(errorMsg);
      },
    });
  }

  deleteDoctor(doctorId: number): void {
    this.pageError.set(null);
    this.pageMessage.set(null);

    this.doctorsService.deleteDoctor(doctorId).subscribe({
      next: () => {
        this.pageMessage.set('Medecin supprime.');
        this.loadData();
      },
      error: (err) => {
        if (err?.error?.hasReports) {
          // Find doctor name
          const doctor = this.doctors().find((d) => d.id === doctorId);
          const doctorName = doctor ? `${doctor.firstname} ${doctor.lastname}` : 'Ce médecin';
          this.deleteConfirmDoctorId.set(doctorId);
          this.deleteConfirmDoctorName.set(doctorName);
          this.showDeleteConfirm.set(true);
        } else {
          this.pageError.set(err?.error?.error || 'Suppression impossible.');
        }
      },
    });
  }

  confirmDelete(confirmed: boolean): void {
    if (!confirmed) {
      this.showDeleteConfirm.set(false);
      this.deleteConfirmDoctorId.set(null);
      this.deleteConfirmDoctorName.set('');
      return;
    }

    const doctorId = this.deleteConfirmDoctorId();
    if (!doctorId) return;

    this.pageError.set(null);
    this.pageMessage.set(null);

    this.doctorsService.forceDeleteDoctor(doctorId).subscribe({
      next: () => {
        this.pageMessage.set('Medecin et ses rapports supprimés.');
        this.showDeleteConfirm.set(false);
        this.deleteConfirmDoctorId.set(null);
        this.deleteConfirmDoctorName.set('');
        this.loadData();
      },
      error: (err) => {
        this.pageError.set(err?.error?.error || 'Suppression impossible.');
        this.showDeleteConfirm.set(false);
        this.deleteConfirmDoctorId.set(null);
        this.deleteConfirmDoctorName.set('');
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private resetForm(): void {
    this.nom.set('');
    this.prenom.set('');
    this.tel.set('');
    this.adresse.set('');
    this.specialitecomplementaire.set('');
    this.departement.set('');
  }
}
