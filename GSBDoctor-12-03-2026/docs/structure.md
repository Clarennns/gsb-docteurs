# Structure du projet

Ce fichier décrit rapidement l'arborescence principale du projet.

- `src/`
  - `app/`
    - `pages/`
      - `doctors-page/` : page principale listant les médecins (`doctors-page.ts`, `doctors-page.html`, `doctors-page.css`).
    - `components/`
      - `doctor-card/` : composant d'affichage d'un médecin.
    - `services/`
      - `doctors.service.ts` : charge les données depuis `assets/doctors.json` et les convertit.
    - `types/`
      - `doctor.interface.ts`, `medecin.interface.ts` : types utilisés dans l'app.
  - `assets/`
    - `doctors.json` : fichier de données local utilisé en développement.

- `README.md` : documentation principale (point d'entrée pour les développeurs).
- `docs/` : documentation additionnelle (this folder).

Notes:
- Les composants utilisent la syntaxe standalone d'Angular.
- La page `doctors-page` utilise les signaux Angular (`signal`, `computed`, `toSignal`) pour la réactivité.