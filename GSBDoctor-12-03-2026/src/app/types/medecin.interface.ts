export interface Medecin {
  id: number;
  nom: string;
  prenom: string;
  email?: string;
  specialite?: string;
  specialitecomplementaire?: string;
  adresse?: string;
  tel?: string;
  departement?: string;
}
