import { Component, input } from '@angular/core';
import { Doctor } from '../../types/doctor.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doctor-card',
  imports: [CommonModule],
  templateUrl: './doctor-card.html',
  styleUrl: './doctor-card.css',
})
export class DoctorCard {
  doctor = input.required<Doctor>();
}
