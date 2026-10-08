import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import Swal from 'sweetalert2';

// Affiche "Mise à jour en cours" au plus une fois toutes les 10s — évite d'empiler
// plusieurs popups identiques quand plusieurs requêtes échouent en même temps
// pendant le court redémarrage du serveur (déploiement d'une nouvelle version).
let dernierToastServeurIndisponible = 0;

// "Fonctionnalité désactivée" : le message n'est montré qu'une fois par fonction pendant la
// session de l'onglet (avant : une fenêtre revenait à chaque ouverture de page).
const CLE_FONCTIONNALITES_SIGNALEES = 'fonctionnalites-desactivees-signalees';
const fonctionnalitesDesactiveesSignalees = new Set<string>(lireFonctionnalitesSignalees());

function lireFonctionnalitesSignalees(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(CLE_FONCTIONNALITES_SIGNALEES) || '[]');
  } catch {
    return [];
  }
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    const token = this.authService.getToken();
    
    // Pour les routes publiques, on ne met pas le token
    if (this.isPublicRoute(request.url)) {
      return next.handle(request);
    }

    if (!token) {
      console.log('❌ Interceptor: Pas de token, redirection vers login');
      // Si pas de token et route non publique, rediriger vers login
      this.router.navigate(['/connexion']);
      return throwError(() => new Error('Non authentifié'));
    }

    // ✅ CORRECTION DÉFINITIVE : Cloner la requête SANS modifier les headers
    // Laissez Angular gérer automatiquement les headers pour FormData
    let clonedRequest: HttpRequest<any>;
    
    if (request.body instanceof FormData) {
      // Pour FormData, n'ajoutez PAS Content-Type, seulement Authorization
      clonedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      // Pour les requêtes normales, ajoutez Content-Type
      clonedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    
    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.handleAuthError(error, clonedRequest.method);
      })
    );
  }

  private isPublicRoute(url: string): boolean {
    const publicRoutes = [
      '/api/auth/login',
      '/api/auth/register',
      '/swagger-ui',
      '/v3/api-docs',
      '/api/vitrine',
      '/assets/i18n'
    ];
    
    return publicRoutes.some(route => url.includes(route));
  }

  private handleAuthError(error: HttpErrorResponse, methode: string): Observable<never> {
    console.error('❌ Interceptor: Erreur HTTP:', error.status, error.message);

    if (error.status === 401) {
      // Token expiré ou invalide : là seulement on déconnecte.
      console.log('❌ Interceptor: Token expiré, déconnexion...');
      this.authService.signout();
      this.router.navigate(['/connexion']);
      return throwError(() => new Error('Session expirée. Veuillez vous reconnecter.'));
    }

    if (error.status === 403) {
      // BUG CORRIGÉ : un 403 (session valide mais action non autorisée) était traité
      // comme un 401 et déconnectait l'utilisateur — un vendeur qui heurtait une
      // fonctionnalité désactivée ou une action réservée à l'admin se retrouvait
      // renvoyé à l'écran de connexion au lieu de voir simplement pourquoi c'est
      // refusé. On reste connecté et on affiche le message du serveur.
      if (error.error?.errorCode === 'FEATURE_DISABLED') {
        // Le message détaillé arrive dans "message" (GlobalExceptionHandler) pour la
        // plupart des contrôleurs, mais dans "error" pour ceux qui ont leur propre
        // gestionnaire local (ex: DetteAncienneController) — on vérifie les deux.
        // Chargement automatique d'une page (GET) : aucun message, la partie reste vide.
        // Action de la personne (enregistrer, créer...) : petit message, une fois par fonction.
        if (methode !== 'GET') {
          this.afficherFonctionnaliteDesactivee(error.error?.message || error.error?.error);
        }
      }
      return throwError(() => error);
    }

    if (error.status === 0) {
      // Aucune réponse HTTP du tout : soit le navigateur n'a pas d'accès internet,
      // soit le réseau est bon mais LE SERVEUR de cette boutique ne répond pas —
      // cas typique d'un redémarrage après déploiement (10-20s). navigator.onLine
      // permet de distinguer les deux (pas fiable à 100% mais suffisant ici).
      this.signalerServeurIndisponibleSiPertinent();
    }

    return throwError(() => error);
  }

  private afficherFonctionnaliteDesactivee(message?: string): void {
    const texte = message || "Cette fonctionnalité est désactivée par le super admin de la boutique. Pour plus d'informations, contactez Maiga Consulting.";
    if (fonctionnalitesDesactiveesSignalees.has(texte)) return;
    fonctionnalitesDesactiveesSignalees.add(texte);
    try {
      sessionStorage.setItem(CLE_FONCTIONNALITES_SIGNALEES, JSON.stringify([...fonctionnalitesDesactiveesSignalees]));
    } catch { /* stockage indisponible : le message pourra revenir après rechargement */ }

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Fonctionnalité désactivée',
      text: texte,
      showConfirmButton: false,
      backdrop: false,
      timer: 6000,
      timerProgressBar: true
    });
  }

  private signalerServeurIndisponibleSiPertinent(): void {
    if (!navigator.onLine) return;
    const maintenant = Date.now();
    if (maintenant - dernierToastServeurIndisponible <= 10000) return;
    dernierToastServeurIndisponible = maintenant;

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Mise à jour en cours, veuillez patienter quelques instants...',
      showConfirmButton: false,
      timer: 6000,
      timerProgressBar: true
    });
  }
}