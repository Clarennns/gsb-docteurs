/**
 * Réponse de l'API lors de la connexion
 * Contient le ticket d'authentification
 */
export interface AuthTicket {
  ticket: string; // Token d'authentification
  userId: string; // Identifiant de l'utilisateur
  username: string; // Nom d'utilisateur
}

/**
 * Informations de connexion envoyées à l'API
 */
export interface LoginCredentials {
  login: string; // Nom d'utilisateur
  password: string; // Mot de passe
}

export interface RegisterPayload {
  login: string;
  password: string;
  nom: string;
  prenom: string;
  adresse?: string;
  cp?: string;
  ville?: string;
}
