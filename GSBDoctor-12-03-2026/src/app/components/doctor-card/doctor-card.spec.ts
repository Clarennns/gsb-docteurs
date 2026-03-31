import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';

import { DoctorCard } from './doctor-card';
import { Doctor } from '../../types/doctor.interface';

describe('DoctorCard', () => {
  let component: DoctorCard;
  let fixture: ComponentFixture<DoctorCard>;

  const mockDoctor: Doctor = {
    id: 1,
    firstname: 'John',
    lastname: 'Doe',
    address: '123 Main St',
    speciality: 'Cardiology',
    email: 'john.doe@example.com'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('doctor', mockDoctor);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
