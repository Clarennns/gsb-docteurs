# Développement local

## Prérequis

- Node.js (LTS recommandé)
- npm

## Installation

À la racine du projet :

```powershell
npm install
```

## Lancer l'application (dev)

```powershell
npm start
```

Cette commande démarre le serveur de développement. Par défaut, ouvrez `http://localhost:4200/`.

## Tests

- Tests unitaires :

```powershell
npm test
```

## Linter / Format

Ajoutez ici vos commandes de linter/format si vous en avez (ex : `npm run lint`).

## Ajout d'un médecin (données locales)

- Modifiez `src/assets/doctors.json` et ajoutez une entrée selon le format existant.
- Le service `DoctorsService` se charge de la conversion côté application.

## Notes de debug

- Si Angular ne recharge pas, vérifiez la console et relancez `npm start`.
- Sur Windows, utilisez PowerShell ou `cmd` selon vos préférences.