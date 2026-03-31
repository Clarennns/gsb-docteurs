import { Medecin } from '../types/medecin.interface';
import { Doctor } from '../types/doctor.interface';

// Fonction classique (pas fléchée)
export function convertMedecinToDoctor(medecin: Medecin): Doctor {
  return {
    id: medecin.id,
    firstname: medecin.prenom,
    lastname: medecin.nom,
    email: medecin.email || '',
    phone: medecin.tel || '',
    speciality: medecin.specialite || medecin['specialitecomplementaire'] || '',
    address: medecin.adresse || '',
    department: medecin.departement || '',
  };
}
