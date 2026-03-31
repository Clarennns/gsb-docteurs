export interface Doctor {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  speciality: string;
  address: string;
  phone?: string;
  department?: string;
}
