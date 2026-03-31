# GSBDoctor

Documentation principale du projet GSBDoctor - Application Angular sécurisée pour la gestion et la consultation de médecins.

## Aperçu

GSBDoctor est une application Angular complète avec **authentification sécurisée** qui permet de consulter et rechercher des médecins. L'application utilise une API REST pour l'authentification et charge les données des médecins via `DoctorsService`. La page principale propose un champ de recherche réactif qui filtre la liste en temps réel.

## Stack technique

- **Framework**: Angular 20.3.0 (standalone components)
- **Langage**: TypeScript 5.9.2
- **Réactivité**: Angular Signals (`signal`, `computed`, `toSignal`)
- **HTTP**: HttpClient avec intercepteurs pour l'authentification
- **Routing**: Angular Router avec guards de protection
- **CLI**: Angular CLI 20.3.8
- **Tests**: Jasmine + Karma
- **Build**: Angular Build (esbuild)

## Fonctionnalités principales

### 🔐 Authentification
- Système de connexion sécurisé avec API REST (`http://restsecufinal.test`)
- Gestion de session avec tickets d'authentification
- Persistance de session dans localStorage
- Déconnexion et gestion des erreurs d'authentification
- Protection automatique des routes avec `authGuard`
- Intercepteur HTTP qui ajoute le ticket à toutes les requêtes

### 👨‍⚕️ Gestion des médecins
- Chargement des médecins depuis l'API (ou `assets/doctors.json` en développement)
- Affichage des médecins avec le composant `DoctorCard`
- Recherche en temps réel par nom, spécialité, email ou adresse
- Interface réactive utilisant les Signals Angular

## Prérequis

- Node.js (LTS recommandé) et npm
- API REST GSB accessible (par défaut : `http://restsecufinal.test`)

## Installation et exécution (développement)

Ouvrez PowerShell (ou un terminal) à la racine du projet puis :

```powershell
npm install
npm start
```

L'application sera accessible sur `http://localhost:4200/` (ou un autre port si celui-ci est occupé).

**Note importante** : Si vous rencontrez des problèmes d'exécution de scripts PowerShell, utilisez :

```powershell
cmd /c "npx ng serve"
```

## Connexion à l'application

1. Accédez à `http://localhost:4200/`
2. Vous serez automatiquement redirigé vers `/login`
3. Utilisez vos identifiants pour vous connecter
4. Une fois authentifié, vous accédez à la liste des médecins sur `/doctors`

**Session persistante** : Votre session reste active même après un rechargement de page grâce au localStorage.

## Tests

Pour lancer les tests unitaires :

```powershell
# Tests en mode watch (par défaut)
npm test

# Tests en mode headless (CI/CD)
npx ng test --watch=false --browsers=ChromeHeadless
```

**État actuel** : 5 tests passent avec succès ✅
- Composants : `LoginComponent`, `DoctorCard`, `DoctorsPageComponent`
- Service : `AuthService`
- Application : `App`

Les tests utilisent `TestBed` avec support des composants standalone et incluent les providers nécessaires (`provideHttpClient`, `provideRouter`).

## Routes de l'application

| Route | Composant | Protection | Description |
|-------|-----------|------------|-------------|
| `/` | - | - | Redirige vers `/login` |
| `/login` | `LoginComponent` | ❌ Public | Page de connexion |
| `/doctors` | `DoctorsPageComponent` | ✅ `authGuard` | Liste des médecins (protégée) |
| `/**` | - | - | Redirige vers `/login` |

### Navigation

**Flux d'authentification** :
1. L'utilisateur accède à l'application → redirection vers `/login`
2. Après connexion réussie → redirection vers `/doctors`
3. Si l'utilisateur tente d'accéder à `/doctors` sans être authentifié → redirection vers `/login`
4. Session persistante → l'utilisateur reste connecté après rechargement

## Scripts disponibles

```powershell
npm start          # Démarre le serveur de développement (port 4200)
npm run build      # Build de production dans dist/
npm run watch      # Build en mode watch
npm test           # Lance les tests unitaires
npm run ng         # Accès direct à Angular CLI
```

## Structure du projet

### Architecture principale

```
src/
├── app/
│   ├── components/
│   │   ├── login/              # Composant de connexion
│   │   │   ├── login.ts
│   │   │   ├── login.html
│   │   │   ├── login.css
│   │   │   └── login.spec.ts
│   │   └── doctor-card/        # Carte d'affichage d'un médecin
│   │       ├── doctor-card.ts
│   │       ├── doctor-card.html
│   │       ├── doctor-card.css
│   │       └── doctor-card.spec.ts
│   │
│   ├── pages/
│   │   └── doctors-page/       # Page principale de la liste des médecins
│   │       ├── doctors-page.ts
│   │       ├── doctors-page.html
│   │       ├── doctors-page.css
│   │       └── doctors-page.spec.ts
│   │
│   ├── services/
│   │   ├── auth.ts             # Service d'authentification (avec Signals)
│   │   ├── auth.spec.ts
│   │   └── doctors.service.ts  # Service de gestion des médecins
│   │
│   ├── guards/
│   │   └── auth.guard.ts       # Guard de protection des routes
│   │
│   ├── interceptors/
│   │   └── auth.interceptor.ts # Intercepteur HTTP pour ajouter le ticket
│   │
│   ├── types/
│   │   ├── auth.model.ts       # Types pour l'authentification
│   │   ├── doctor.interface.ts # Interface Doctor
│   │   └── medecin.interface.ts# Interface Medecin (format API)
│   │
│   ├── helpers/
│   │   └── convert-medecin-to-doctor.ts # Conversion Medecin -> Doctor
│   │
│   ├── app.routes.ts           # Configuration des routes
│   ├── app.config.ts           # Configuration de l'application
│   └── app.ts                  # Composant racine
│
└── assets/
    └── doctors.json            # Données de développement
```

### Composants clés

**`LoginComponent`** : Page de connexion avec formulaire réactif utilisant les Signals. Gère l'authentification via `AuthService`.

**`DoctorsPageComponent`** : Page protégée affichant la liste des médecins avec recherche en temps réel. Utilise `toSignal` pour convertir l'Observable en Signal.

**`DoctorCard`** : Composant standalone pour afficher les informations d'un médecin (carte réutilisable).

### Services

**`AuthService`** : 
- Gestion complète de l'authentification avec Signals
- Méthodes : `login()`, `logout()`, `getTicket()`, `isAuthenticated()`
- Persistance de session avec localStorage
- API REST : GET `/login?login=...&password=...`

**`DoctorsService`** : 
- Chargement de la liste des médecins
- Conversion des données via le helper `convertMedecinToDoctor`

### Guards & Intercepteurs

**`authGuard`** : Protège les routes nécessitant une authentification. Redirige vers `/login` si non authentifié.

**`authInterceptor`** : Ajoute automatiquement le ticket d'authentification comme paramètre de requête à toutes les requêtes HTTP sortantes.

## Développement et bonnes pratiques

### Architecture moderne Angular
- **Standalone Components** : Tous les composants sont autonomes (pas de NgModules)
- **Signals** : Utilisation intensive des Signals pour la réactivité (`signal`, `computed`, `toSignal`)
- **Functional Guards** : `authGuard` utilise `CanActivateFn`
- **Functional Interceptors** : `authInterceptor` utilise `HttpInterceptorFn`
- **Injection with inject()** : Utilisation de la fonction `inject()` au lieu du constructeur

### Gestion d'état
L'application utilise les **Signals Angular** pour un état réactif :
- `AuthService` expose des Signals : `isAuthenticated()`, `currentUser()`, `errorMessage()`
- Les composants utilisent `computed()` pour des valeurs dérivées
- `toSignal()` convertit les Observables en Signals pour une meilleure intégration

### Style de code
- TypeScript strict activé
- Prettier configuré (printWidth: 100, singleQuote: true)
- Évitez les changements de style massifs pour maintenir la cohérence

## Fonctionnalité de recherche

La page des médecins (`/doctors`) propose un champ de recherche dynamique :
- **Recherche en temps réel** : Filtrage instantané lors de la saisie
- **Multi-critères** : Recherche sur nom complet (prénom + nom), spécialité, email et adresse
- **Insensible à la casse** : La recherche ne tient pas compte des majuscules/minuscules
- **Implémentation** : Utilise un `computed()` Signal qui se met à jour automatiquement

```typescript
// Exemple d'utilisation dans doctors-page.ts
searchTerm = signal('');
filteredDoctors = computed(() => {
  const list = this.doctors();
  const term = this.searchTerm().trim().toLowerCase();
  if (!term) return list;
  return list.filter((d: Doctor) => {
    const fullName = (d.firstname + ' ' + d.lastname).toLowerCase();
    return (
      fullName.includes(term) ||
      (d.speciality || '').toLowerCase().includes(term) ||
      (d.email || '').toLowerCase().includes(term) ||
      (d.address || '').toLowerCase().includes(term)
    );
  });
});
```

## Configuration de l'API

### URL de l'API
L'application se connecte à l'API REST GSB définie dans `AuthService` :

```typescript
private readonly API_URL = 'http://restsecufinal.test';
```

Pour modifier l'URL de l'API, éditez le fichier [src/app/services/auth.ts](src/app/services/auth.ts#L15).

### Format de réponse attendu

**Endpoint de connexion** : `GET /login?login=username&password=password`

Réponse attendue :
```json
{
  "ticket": "auth_token_string",
  "userId": "user_id",
  "username": "username"
}
```

## Ajouter/modifier des médecins

Pour le développement, modifiez `src/assets/doctors.json` :

```json
[
  {
    "id": 1,
    "firstname": "Jean",
    "lastname": "Dupont",
    "email": "jean.dupont@example.com",
    "speciality": "Cardiologue",
    "address": "123 rue de la Santé"
  }
]
```

Le service `DoctorsService` convertit automatiquement les objets `Medecin` en `Doctor` via le helper `convertMedecinToDoctor`.

## Problèmes courants et solutions

### Erreur d'exécution de scripts PowerShell
Si vous obtenez une erreur sur l'exécution de scripts :
```powershell
# Solution 1 : Utiliser cmd
cmd /c "npm start"

# Solution 2 : Modifier la politique d'exécution (admin requis)
Set-ExecutionPolicy RemoteSigned
```

### Port 4200 déjà utilisé
```powershell
# Utiliser un autre port
cmd /c "npx ng serve --port 4201"
```

### Erreurs d'authentification
- Vérifiez que l'API REST est accessible à `http://restsecufinal.test`
- Vérifiez les identifiants de connexion
- Consultez la console du navigateur pour les détails des erreurs

## Contribution

1. Créez une branche feature : `git checkout -b feature/ma-fonctionnalite`
2. Effectuez vos modifications
3. Assurez-vous que tous les tests passent : `npm test`
4. Vérifiez qu'il n'y a pas d'erreurs de compilation : `npm run build`
5. Committez vos changements : `git commit -m "Description"`
6. Poussez la branche : `git push origin feature/ma-fonctionnalite`
7. Ouvrez une Pull Request détaillant vos modifications

## Fichiers de documentation

Documentation détaillée disponible dans le répertoire `docs/` :
- `docs/structure.md` : arborescence et description rapide des dossiers
- `docs/development.md` : instructions détaillées pour le développement local
- `docs/api.md` : description des services, composants et types
- `docs/usage.md` : exemples d'utilisation et notes sur la recherche

## Technologies et versions

- **Angular** : 20.3.0
- **TypeScript** : 5.9.2
- **RxJS** : 7.8.0
- **Zone.js** : 0.15.0
- **Node.js** : LTS recommandé

## Licence

Ajoutez ici la licence de votre projet si nécessaire (ex : MIT).

---

**Développé avec Angular 20+ et Signals** 🚀

Pour toute question ou problème, consultez la documentation dans le dossier `docs/` ou ouvrez une issue sur le repository.
