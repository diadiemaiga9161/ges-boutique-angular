export const environment = {
  production: false,
  appName: 'Boutique Maiga',
  version: '1.0.0',
  enableDebug: true,
  
  // URL du backend Spring Boot
  apiUrl: '/api',

  // Liste des autres boutiques (même liste que Ionic/React Native) — sert au lien
  // "Changer de boutique" dans le menu profil, pour un admin qui gère plusieurs
  // boutiques. Chaque boutique est un déploiement séparé, ce lien fait juste une
  // vraie navigation vers l'adresse web de l'autre boutique.
  boutiques: [
    { nom: 'Fatma Zahara',      url: 'https://fatmazahara.mg-consulting.site' },
    { nom: 'Moh',               url: 'https://moh.mg-consulting.site' },
    { nom: 'Magaouba Kabala',   url: 'https://magaoubakabala.mg-consulting.site' },
    { nom: 'Baran Djim',        url: 'https://barandjim.mg-consulting.site' },
    { nom: 'Bou Bandjim',       url: 'https://boubandjim.mg-consulting.site' },
  ],

  // Configuration JWT
  tokenKey: 'boutique_auth_token',
  userKey: 'boutique_user_data',
  
  // Timeout des requêtes HTTP (en millisecondes)
  httpTimeout: 30000,
  
  // Configuration des retry
  httpRetry: {
    maxAttempts: 3,
    delay: 1000
  },
  
  // Configuration des logs
  logging: {
    level: 'debug',
    enableConsole: true
  }
};