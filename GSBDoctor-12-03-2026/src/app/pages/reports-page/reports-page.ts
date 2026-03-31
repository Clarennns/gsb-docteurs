import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { AuthService } from '../../services/auth';
import { ReportsService } from '../../services/reports.service';
import {
  ApiDoctorLite,
  ApiMedicineLite,
  CreateReportPayload,
  Report,
} from '../../types/report.interface';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reports-page.html',
  styleUrl: './reports-page.css',
})
export class ReportsPageComponent {
  private readonly reportsService = inject(ReportsService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly reports = signal<Report[]>([]);
  protected readonly doctors = signal<ApiDoctorLite[]>([]);
  protected readonly medicines = signal<ApiMedicineLite[]>([]);

  protected readonly date = signal('');
  protected readonly motive = signal('');
  protected readonly balanceSheet = signal('');
  protected readonly doctorId = signal<number | null>(null);
  protected readonly medicinesForm = signal<Array<{ medicineId: string; quantity: number }>>([
    { medicineId: '', quantity: 1 },
  ]);

  protected readonly isSubmitting = signal(false);
  protected readonly pageMessage = signal<string | null>(null);
  protected readonly pageError = signal<string | null>(null);
  protected readonly editingReportId = signal<number | null>(null);

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.pageError.set(null);

    forkJoin({
      reports: this.reportsService.getReports().pipe(catchError(() => of([]))),
      doctors: this.reportsService.getDoctorsLite().pipe(catchError(() => of([]))),
      medicines: this.reportsService.getMedicinesLite().pipe(catchError(() => of([]))),
    }).subscribe({
      next: (result) => {
        this.reports.set(result.reports);
        this.doctors.set(result.doctors);
        this.medicines.set(result.medicines);

        if (!result.doctors.length || !result.medicines.length) {
          this.pageError.set('Chargement partiel des donnees.');
        }
      },
      error: () => {
        this.pageError.set('Impossible de charger les donnees.');
      },
    });
  }

  addMedicineRow(): void {
    this.medicinesForm.update((rows) => [...rows, { medicineId: '', quantity: 1 }]);
  }

  removeMedicineRow(index: number): void {
    this.medicinesForm.update((rows) => rows.filter((_, i) => i !== index));
    if (this.medicinesForm().length === 0) {
      this.medicinesForm.set([{ medicineId: '', quantity: 1 }]);
    }
  }

  updateMedicineRow(index: number, key: 'medicineId' | 'quantity', value: string): void {
    this.medicinesForm.update((rows) =>
      rows.map((row, i) =>
        i === index ? { ...row, [key]: key === 'quantity' ? Number(value) : value } : row,
      ),
    );
  }

  setDoctorIdFromValue(value: string): void {
    const parsed = Number(value);
    this.doctorId.set(Number.isNaN(parsed) ? null : parsed);
  }

  editReport(report: Report): void {
    this.reportsService.getReportById(report.id).subscribe({
      next: (full) => {
        this.editingReportId.set(full.id);
        this.date.set(full.date || '');
        this.motive.set(full.motive || '');
        this.balanceSheet.set(full.balanceSheet || '');
        this.doctorId.set(full.doctor?.id || null);

        const medicines = (full.medicines || []).map((m) => ({
          medicineId: m.id,
          quantity: Number(m.quantity) || 1,
        }));
        this.medicinesForm.set(medicines.length ? medicines : [{ medicineId: '', quantity: 1 }]);
      },
      error: () => {
        this.pageError.set('Impossible de charger ce rapport pour edition.');
      },
    });
  }

  cancelEdit(): void {
    this.editingReportId.set(null);
    this.resetForm();
  }

  submit(): void {
    this.pageError.set(null);
    this.pageMessage.set(null);

    if (this.isSubmitting()) {
      return;
    }

    const cleanedMedicines = this.medicinesForm().filter(
      (m) => m.medicineId && Number.isInteger(Number(m.quantity)) && Number(m.quantity) > 0,
    );

    if (
      !this.date() ||
      !this.motive() ||
      !this.balanceSheet() ||
      !this.doctorId() ||
      !cleanedMedicines.length
    ) {
      this.pageError.set('Tous les champs requis doivent etre renseignes.');
      return;
    }

    if (this.motive().trim().length > 100 || this.balanceSheet().trim().length > 100) {
      this.pageError.set('Le motif et le bilan doivent contenir au maximum 100 caracteres.');
      return;
    }

    const payload: CreateReportPayload = {
      date: this.date(),
      motive: this.motive(),
      balanceSheet: this.balanceSheet(),
      doctorId: Number(this.doctorId()),
      medicines: cleanedMedicines,
    };

    this.isSubmitting.set(true);

    const editingId = this.editingReportId();
    const request = editingId
      ? this.reportsService.updateReport(editingId, payload)
      : this.reportsService.createReport(payload);

    request.subscribe({
      next: () => {
        this.pageMessage.set(editingId ? 'Rapport mis a jour.' : 'Rapport cree.');
        this.isSubmitting.set(false);
        this.editingReportId.set(null);
        this.resetForm();
        this.loadData();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.pageError.set(err?.error?.error || 'Operation impossible.');
      },
    });
  }

  deleteReport(reportId: number): void {
    this.pageError.set(null);
    this.pageMessage.set(null);

    this.reportsService.deleteReport(reportId).subscribe({
      next: () => {
        this.pageMessage.set('Rapport supprime.');
        this.loadData();
      },
      error: (err) => {
        this.pageError.set(err?.error?.error || 'Suppression impossible.');
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private resetForm(): void {
    this.date.set('');
    this.motive.set('');
    this.balanceSheet.set('');
    this.doctorId.set(null);
    this.medicinesForm.set([{ medicineId: '', quantity: 1 }]);
  }
}
