export const environment = {
  production: false,
  appName: 'Boutique Maiga',
  version: '1.0.0',
  enableDebug: true,
  
  // URL du backend Spring Boot
  apiUrl: '/api',
  
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