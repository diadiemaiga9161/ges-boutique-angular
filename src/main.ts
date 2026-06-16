/// <reference types="@angular/localize" />

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// ============================================
// CONFIGURATION PRODUCTION
// ============================================
if (environment.production) {
  enableProdMode();
  
  // Désactiver les logs en production sauf pour les erreurs critiques
  if (!environment.enableDebug) {
    const noop = () => {};
    console.log = noop;
    console.info = noop;
    console.warn = noop;
    // Garder console.error pour les erreurs critiques
  }
}

// ============================================
// GESTION DES ERREURS DE DÉMARRAGE
// ============================================
function handleBootstrapError(error: any) {
  console.error('Erreur fatale lors du démarrage de l\'application:', error);
  
  // Afficher un message d'erreur convivial
  const errorHtml = `
    <div style="
      font-family: 'Segoe UI', Arial, sans-serif;
      text-align: center;
      padding: 50px 20px;
      background: #f8f9fa;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        background: white;
        padding: 40px;
        border-radius: 10px;
        box-shadow: 0 2px 20px rgba(0,0,0,0.1);
        max-width: 600px;
        width: 100%;
      ">
        <div style="margin-bottom: 30px;">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#dc3545" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        
        <h1 style="color: #343a40; margin-bottom: 20px; font-size: 24px;">
          Erreur de chargement de l'application
        </h1>
        
        <p style="color: #6c757d; margin-bottom: 25px; line-height: 1.6;">
          Une erreur est survenue lors du démarrage de l'application ${environment.appName}.
          ${environment.production ? '' : 'Détails de l\'erreur dans la console.'}
        </p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 25px;">
          <p style="margin: 0; font-size: 14px; color: #495057;">
            <strong>Application :</strong> ${environment.appName}<br>
            <strong>Version :</strong> ${environment.version}<br>
            <strong>Mode :</strong> ${environment.production ? 'Production' : 'Développement'}<br>
            <strong>API Backend :</strong> ${environment.apiUrl}
          </p>
        </div>
        
        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
          <button onclick="window.location.reload()" style="
            padding: 12px 30px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
          " onmouseover="this.style.background='#0056b3'" onmouseout="this.style.background='#007bff'">
            Rafraîchir la page
          </button>
          
          <button onclick="testBackendConnection()" style="
            padding: 12px 30px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
          " onmouseover="this.style.background='#218838'" onmouseout="this.style.background='#28a745'">
            Tester la connexion
          </button>
          
          <button onclick="history.back()" style="
            padding: 12px 30px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
          " onmouseover="this.style.background='#545b62'" onmouseout="this.style.background='#6c757d'">
            Retour
          </button>
        </div>
        
        <div id="testResult" style="margin-top: 20px; display: none;"></div>
        
        <p style="margin-top: 25px; font-size: 14px; color: #6c757d;">
          Si le problème persiste, vérifiez que le serveur backend est démarré sur ${environment.apiUrl}
        </p>
      </div>
    </div>
  `;
  
  // Remplacer tout le contenu de la page
  document.body.innerHTML = errorHtml;
  document.title = 'Erreur - ' + environment.appName;
  
  // Ajouter la fonction de test
  (window as any).testBackendConnection = async function() {
    const resultDiv = document.getElementById('testResult');
    if (resultDiv) {
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = '<p style="color: #6c757d;">Test de connexion en cours...</p>';
      
      try {
        const response = await fetch(`${environment.apiUrl}/test/cors`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.text();
          resultDiv.innerHTML = `
            <p style="color: #28a745;">
              ✅ Connexion réussie!<br>
              <small>Backend: ${environment.apiUrl}</small><br>
              <small>Réponse: ${data}</small>
            </p>
          `;
        } else {
          resultDiv.innerHTML = `
            <p style="color: #dc3545;">
              ❌ Erreur de connexion (${response.status})<br>
              <small>Backend: ${environment.apiUrl}</small>
            </p>
          `;
        }
      } catch (error) {
        resultDiv.innerHTML = `
          <p style="color: #dc3545;">
            ❌ Impossible de se connecter au serveur<br>
            <small>Erreur: ${(error as Error).message}</small><br>
            <small>Assurez-vous que Spring Boot est démarré sur localhost:8080</small>
          </p>
        `;
      }
    }
  };
}

// ============================================
// FONCTION DE DÉMARRAGE PRINCIPALE
// ============================================
function bootstrapApplication() {
  // Vérifier d'abord si le backend est accessible
  if (!environment.production) {
    console.log(`Démarrage ${environment.appName} v${environment.version}`);
    console.log(`Environnement: ${environment.production ? 'Production' : 'Développement'}`);
    console.log(`API Backend: ${environment.apiUrl}`);
    
   
  }
  
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(handleBootstrapError);
}

// ============================================
// VÉRIFICATION DE LA CONNEXION RÉSEAU
// ============================================
function checkNetworkConnection() {
  if (!navigator.onLine) {
    console.warn('Application démarrée hors ligne');
    
    // Ajouter un écouteur pour détecter le retour en ligne
    window.addEventListener('online', () => {
      console.info('Connexion réseau rétablie');
      if (sessionStorage.getItem('refreshOnOnline') === 'true') {
        sessionStorage.removeItem('refreshOnOnline');
        window.location.reload();
      }
    });
    
    window.addEventListener('offline', () => {
      console.warn('Connexion réseau perdue');
      sessionStorage.setItem('refreshOnOnline', 'true');
    });
  }
}

// ============================================
// DÉMARRAGE DE L'APPLICATION
// ============================================
// Attendre que le DOM soit prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    checkNetworkConnection();
    bootstrapApplication();
  });
} else {
  checkNetworkConnection();
  bootstrapApplication();
}

// ============================================
// GESTION DES ERREURS GLOBALES
// ============================================
window.addEventListener('error', (event) => {
  console.error('Erreur globale capturée:', event.error);
  
  if (!environment.production || environment.enableDebug) {
    console.error('Stack trace:', event.error?.stack);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promesse non gérée rejetée:', event.reason);
});

// ============================================
// GESTION DE LA VISIBILITÉ DE LA PAGE
// ============================================
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.debug('Page visible');
  } else {
    console.debug('Page cachée');
  }
});