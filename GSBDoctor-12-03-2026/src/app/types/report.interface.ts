export interface ReportMedicine {
  id: string;
  businessName: string;
  quantity: number;
}

export interface Report {
  id: number;
  date: string;
  motive: string;
  balanceSheet: string;
  doctor?: {
    id: number;
    lastname: string;
    firstname: string;
  } | null;
  visitor?: {
    id: string;
    lastname: string;
    firstname: string;
  } | null;
  medicines?: ReportMedicine[];
}

export interface CreateReportPayload {
  date: string;
  motive: string;
  balanceSheet: string;
  doctorId: number;
  medicines: Array<{
    medicineId: string;
    quantity: number;
  }>;
}

export interface ApiDoctorLite {
  id: number;
  nom: string;
  prenom: string;
}

export interface ApiMedicineLite {
  id: string;
  businessName: string;
}
