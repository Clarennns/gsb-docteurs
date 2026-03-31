import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import {
  ApiDoctorLite,
  ApiMedicineLite,
  CreateReportPayload,
  Report,
} from '../types/report.interface';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${window.location.protocol}//${window.location.hostname}:3000`;

  getReports(): Observable<Report[]> {
    return this.http
      .get<{ reports: Report[] }>(`${this.apiUrl}/rapports/me?page=1&element=50`)
      .pipe(
        map((r) => r.reports || []),
        catchError(() =>
          this.http
            .get<{ reports: Report[] } | Report[]>(`${this.apiUrl}/rapports?page=1&element=50`)
            .pipe(map((r) => (Array.isArray(r) ? r : r.reports || []))),
        ),
      );
  }

  getReportById(id: number): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/rapports/${id}`);
  }

  createReport(payload: CreateReportPayload): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/rapports`, payload);
  }

  updateReport(id: number, payload: CreateReportPayload): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/rapports/${id}`, payload);
  }

  deleteReport(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/rapports/${id}`);
  }

  getDoctorsLite(): Observable<ApiDoctorLite[]> {
    return this.http
      .get<{ medecins: ApiDoctorLite[] }>(`${this.apiUrl}/medecins?page=1&element=500`)
      .pipe(map((r) => r.medecins || []));
  }

  getMedicinesLite(): Observable<ApiMedicineLite[]> {
    return this.http
      .get<{
        medicines: Array<{ id: string; 'business name': string }>;
      }>(`${this.apiUrl}/medicaments?page=1&element=200`)
      .pipe(
        map((r) =>
          (r.medicines || []).map((m) => ({
            id: m.id,
            businessName: m['business name'],
          })),
        ),
      );
  }
}
