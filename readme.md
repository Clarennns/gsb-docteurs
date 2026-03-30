GSB Docteurs — API Node.js
API REST Node.js pour la gestion des médecins, médicaments et rapports de visite GSB, avec authentification JWT et base de données MySQL via Docker.

Prérequis
Avant de commencer, assurez-vous d'avoir installé sur votre machine :

Node.js
Docker


1. Installation
Cloner le projet
bashgit clone https://github.com/samir7500/gsb-node-api-samir.git
cd [repertoire-du-projet]
Configurer l'environnement
Renommez le fichier .env en .env.test :
bashmv .env .env.test
Installer les dépendances
bashnpm install
Lancer les conteneurs Docker
bashdocker compose up -d
Deux conteneurs seront créés :
ConteneurRôlegsbDbBase de données MySQLgsbAdminerInterface web pour consulter la BDD
Configurer Adminer
Ouvrez votre navigateur à l'adresse http://localhost:8080 et renseignez les informations suivantes :
ChampValeurDialectmysqlHôtegsbDbUtilisateuruser_gsbMot de passepassword_gsb
Validez. La base de données gsb_frais devrait apparaître.
Depuis Adminer, vous pouvez importer le fichier SQL présent dans le dossier database/.

2. Démarrage
bashnpm start
L'API est maintenant accessible sur http://localhost:3000.

3. Endpoints
Authentification
MéthodeRouteDescriptionPOST/connexionConnexion — retourne un token JWTGET/deconnexionDéconnexion
POST /connexion
json{
  "login": "admin",
  "password": "admin"
}
GET /deconnexion — header requis :
Authorization: Bearer <token>

Médecins
MéthodeRouteDescriptionGET/medecinsListe des médecinsGET/api/medicins/:idDétail d'un médecin
Paramètres de pagination et filtrage disponibles sur /medecins :
ParamètreDescriptionpageNuméro de la pageelementNombre d'éléments par pagenameFiltrer par nom ou prénom du médecin

Médicaments
MéthodeRouteDescriptionGET/api/medicamentsListe des médicaments

Rapports de visite
MéthodeRouteDescriptionGET/rapportsListe des rapportsGET/rapports/:idDétail d'un rapportPOST/rapportsCréer un rapport (authentifié)
POST /rapports — header requis :
Authorization: Bearer <token>
Body :
json{
  "balanceSheet": "Bilan ok",
  "motive": "Visite routine",
  "doctorId": 1,
  "date": "2026-03-14",
  "medicineId": "3MYC7",
  "quantity": 2
}
Paramètres de pagination disponibles sur /rapports :
ParamètreDescriptionpageNuméro de la pageelementNombre d'éléments par page

4. Structure du projet
gsb-docteurs/
├── config/          # Configuration BDD et JWT
├── controllers/     # Logique métier des routes
├── database/        # Fichier SQL d'import
├── models/          # Modèles Sequelize
├── routes/          # Définition des routes
├── services/        # Services utilitaires
├── app.js           # Point d'entrée de l'application
├── docker-compose.yml
├── .env.test        # Variables d'environnement
└── package.json

5. Déploiement (Heroku)
Une version en ligne est disponible sur Heroku. Pour la démarrer, contactez le développeur directement.

Technologies utilisées

Node.js — Runtime JavaScript
Express — Framework web
MySQL — Base de données relationnelle
Docker — Conteneurisation (MySQL + Adminer)
JWT — Authentification par token
Heroku — Hébergement cloud
