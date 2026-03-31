import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Medecin } from '../types/medecin.interface';
import { Doctor } from '../types/doctor.interface';
import { convertMedecinToDoctor } from '../helpers/convert-medecin-to-doctor';

@Injectable({ providedIn: 'root' })
export class DoctorsService {
  private httpClient = inject(HttpClient);
  private readonly apiUrl = `${window.location.protocol}//${window.location.hostname}:3000`;

  getDoctors(): Observable<Doctor[]> {
    return this.httpClient
      .get<{ medecins: Medecin[] }>(`${this.apiUrl}/medecins?name=&page=1&element=5000`)
      .pipe(map((result) => result.medecins.map(convertMedecinToDoctor)));
  }

  createDoctor(doctor: Medecin): Observable<unknown> {
    return this.httpClient.post(`${this.apiUrl}/medecins`, doctor);
  }

  updateDoctor(id: number, doctor: Medecin): Observable<unknown> {
    return this.httpClient.put(`${this.apiUrl}/medecins/${id}`, doctor);
  }

  deleteDoctor(id: number): Observable<unknown> {
    return this.httpClient.delete(`${this.apiUrl}/medecins/${id}`);
  }

  forceDeleteDoctor(id: number): Observable<unknown> {
    return this.httpClient.delete(`${this.apiUrl}/medecins/${id}/force`);
  }
}
