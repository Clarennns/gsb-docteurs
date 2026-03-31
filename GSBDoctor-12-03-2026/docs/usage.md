# Usage et exemples

## Utiliser la recherche

- Ouvrez la page `Doctors` dans l'application.
- Utilisez le champ de recherche en haut de la liste.
- Termes acceptés : prénom + nom (ex: "Jean Dupont"), spécialité (ex: "Cardiologie"), email ou adresse.
- La recherche est insensible à la casse et se fait en temps réel.

## Exemple d'amélioration rapide

- Ajouter un bouton clear : modifiez `doctors-page.html` et ajoutez un bouton qui appelle `searchTerm.set('')`.
- Ajouter debounce : si vous souhaitez limiter la fréquence du filtrage, vous pouvez remplacer le signal d'entrée par un `debounce` RxJS avant d'alimenter le `signal`.

## Limitations

- Le filtrage est côté client ; pour des fichiers de grande taille, chargez et filtrez côté serveur.
- Pas de pagination actuellement.

## FAQ

- Q: Où se trouvent les données ?
  - R: `src/assets/doctors.json`.

- Q: Comment ajouter un nouveau champ affiché dans la carte ?
  - R: Ajoutez la propriété dans le type `Doctor`, mettez à jour le JSON, et modifiez `doctor-card.html` pour afficher le nouveau champ.