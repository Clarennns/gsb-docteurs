# API interne (services, composants, types)

## Services

- `src/app/services/doctors.service.ts`
  - Fournit la méthode `getDoctors(): Observable<Doctor[]>`.
  - Lit `assets/doctors.json` et map/convertit les objets `Medecin` en `Doctor` via `convert-medecin-to-doctor`.

## Pages / Composants

- `src/app/pages/doctors-page/doctors-page.ts`
  - `doctors`: signal initialisé via `toSignal(this.doctorsService.getDoctors())`.
  - `searchTerm`: `signal<string>` contenant la valeur actuelle du champ de recherche.
  - `filteredDoctors`: `computed` qui filtre `doctors()` en fonction de `searchTerm()`.
  - Template: `doctors-page.html` contient le champ de recherche et boucle sur `filteredDoctors()`.

- `src/app/components/doctor-card/doctor-card.ts`
  - Composant simple (entrée `doctor` requise) qui affiche les informations d'un médecin.

## Types

- `src/app/types/doctor.interface.ts`
  - Interface `Doctor` : `id`, `firstname`, `lastname`, `email`, `speciality`, `address`.

- `src/app/types/medecin.interface.ts`
  - Représente la structure initiale du JSON (voir `assets/doctors.json`).

## Helpers

- `src/app/helpers/convert-medecin-to-doctor.ts`
  - Transforme un objet `Medecin` en `Doctor`.

## Remarques d'implémentation

- Le filtrage est fait côté client (méthode `computed`) : pour de grandes listes, envisagez une recherche côté serveur ou une pagination.
- Les signaux Angular sont utilisés pour conserver la réactivité de manière concise et efficace.