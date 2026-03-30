# 🏥 GSB Docteurs - Gestion des Rapports de Visite (Node.js API)

![Statut du Projet](https://img.shields.io/badge/Statut-Projet%20Scolaire-blue)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**GSB Docteurs** est une API REST développée en **Node.js** pour le laboratoire **Galaxy Swiss Bourdin**. Ce projet permet de gérer les rapports de visite, les médecins et les médicaments via une architecture moderne.

---

## 🚀 1. Installation du projet

### 📋 Prérequis
* **Node.js** installé sur votre machine.
* **Docker** et **Docker Compose** installés sur votre poste.

### 🛠️ Étape par étape

1.  **Clonage du projet :**
    ```bash
    git clone [https://github.com/Clarennns/gsb-docteurs.git](https://github.com/Clarennns/gsb-docteurs.git)
    cd gsb-docteurs
    ```

2.  **Installation des dépendances :**
    ```bash
    npm install
    ```
    *Cette commande installe tous les modules nécessaires listés dans le `package.json` (Express, Sequelize, JWT, etc.).*

3.  **Configuration de l'environnement :**
    Renommez le fichier `.env` en `.env.test` :
    ```bash
    cp .env .env.test
    ```

4.  **Lancement des conteneurs (Docker) :**
    ```bash
    docker compose up -d
    ```
    *Cela crée 2 conteneurs :*
    * `gsbDb` : Un container **MySQL**.
    * `gsbAdminer` : Un container **Adminer** pour consulter la BDD via une interface web.

5.  **Initialisation de la base de données :**
    * Ouvrez votre navigateur sur : [http://localhost:8080](http://localhost:8080)
    * Connectez-vous avec les informations suivantes :
        * **Système :** MySQL
        * **Serveur :** `gsbDb`
        * **Utilisateur :** `user_gsb`
        * **Mot de passe :** `password_gsb`
    * Une fois connecté, la base `gsb_frais` devrait exister.
    * Depuis cette interface, importez la base de données GSB présente dans le dossier `/database`.

---

## ⚙️ 2. Démarrage du projet

Lancez la commande :
```bash
npm start

## 🛣️ 3. Documentation des Routes API

### 🔐 Authentification
* **POST** `/connexion`
    * **Body :** `{ "login": "admin", "password": "admin" }`
    * **Réponse :** Retourne un Bearer Token.
* **GET** `/deconnexion`
    * **Header :** `Authorization: Bearer [votre_token]`

### 👨‍⚕️ Médecins & Médicaments
* **GET** `/medecins` : Liste tous les médecins.
* **GET** `/api/medicins/:id` : Détails d'un médecin spécifique.
* **GET** `/api/medicaments` : Liste des médicaments.

### 📝 Rapports de Visite
* **GET** `/rapports` : Consulter les rapports.
* **GET** `/rapports/:id` : Détails d'un rapport.
* **POST** `/rapports` : Créer un nouveau rapport.
    * **Header :** `Authorization: Bearer [token]`
    * **Body JSON :**
```json
{
  "balanceSheet": "Bilan ok",
  "motive": "Visite routine",
  "doctorId": 1,
  "date": "2026-03-14",
  "medicineId": "3MYC7",
  "quantity": 2

  ├── database/           # Scripts SQL d'initialisation (à importer)
├── src/                # Code source (Controllers, Models, Routes, Middlewares)
├── node_modules/       # Dépendances (générées via npm install)
├── docker-compose.yml  # Configuration Docker (MySQL + Adminer)
├── package.json        # Liste des dépendances et scripts de lancement
└── .env.test           # Configuration des variables d'environnement
