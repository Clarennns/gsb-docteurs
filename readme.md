## 1 . Installation du projet
Prerequis avoir node et docker installer sur son post

il faut cloner le projet

'git clone https://github.com/samir7500/gsb-node-api-samir.git'

Une fois le projet cloner il faut installer les dependences

'cd [repertoire-du-projet]'

Renommez le fichier .env en .env.test

'npm install'

lancez la commande suivante 

'docker compose up -d'

2 containners seront  créer
 - gsbDb : un container mysql 
 - gsbAdminer : un container adminer pour consulter le bdd via une interface

sur un navigateur saisir l'url suivante:

'localhost:8080'

saisir les information suivantes

dialect:mysql
host:gsbDb
username:user_gsb
password:password_gsb

et validez 

la bdd 'gsb_frais' devrait exister

depuis cette interface vous pouvez importez la bdd gsb presente dans le dossier 'database'

## 2. démarrage du projet 

Lancez la commande:
'npm start'
le projet est lancé et pouvez acceder au routes suivantes:

- http://localhost:3000/connexion : POST
  {
  "login": "aribiA",
  "password": "aaaa"
  }

- http://localhost:3000/deconnexion : GET
 "headers: Authorization: Bearer [token]"

- http://localhost:3000/medecins : GET
- http://localhost:3000/api/medicins/:id : GET
- http://localhost:3000/api/medicaments : GET

- http://localhost:3000/rapports : GET
- http://localhost:3000/rapports/:id : GET
- http://localhost:3000/rapports : POST
  "headers: Authorization: Bearer [token]"
  {
      "balanceSheet": "Bilan ok",
      "motive": "Visite routine",
      "doctorId": 1,
      "date": "2026-03-14",
      "medicineId": "3MYC7",
      "quantity": 2
  }
## information supplementaires 
Pour le listing des medecins on peut rajouter les parametres suivants dans la requete:
- page: le nombre d'élément par page
- element : le nombre d'elements de la page
- name : par nom ou prenom du docteur


Pour le listing des rapport on peut rajouter les parametres suivants dans la requete:
- page: le nombre d'élément par page
- element : le nombre d'elements de la page

J'ai mis en place en heroku(version en ligne) si vous souhaiter que je le demmarre vous pouvez m'envoyer un sms
