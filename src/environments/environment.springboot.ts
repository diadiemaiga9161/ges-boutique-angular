export const environment = {
  production: true,
  apiUrl: '/api',  // IMPORTANT: URL relative pour le JAR
  appName: 'Ges Boutique',
  version: '1.0.0',
  baseHref: './',
  useHash: false,
  enableDebug: false,

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
  ]
};