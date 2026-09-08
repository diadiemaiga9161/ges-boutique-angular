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

// Même principe pour "fonctionnalité désactivée" — une page peut déclencher
// plusieurs requêtes vers le même contrôleur désactivé (ex: chargement initial).
let dernierToastFonctionnaliteDesactivee = 0;

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('🔄 Interceptor: URL:', request.url);
    console.log('🔄 Interceptor: Méthode:', request.method);
    console.log('🔄 Interceptor: Body:', request.body);
    console.log('🔄 Interceptor: Body est FormData?', request.body instanceof FormData);
    
    const token = this.authService.getToken();
    
    // Pour les routes publiques, on ne met pas le token
    if (this.isPublicRoute(request.url)) {
      console.log('🔄 Interceptor: Route publique, pas de token');
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
      console.log('✅ Interceptor: FormData détecté - pas de Content-Type');
      // Pour FormData, n'ajoutez PAS Content-Type, seulement Authorization
      clonedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      console.log('✅ Interceptor: Requête normale - ajout Content-Type: application/json');
      // Pour les requêtes normales, ajoutez Content-Type
      clonedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('🔄 Interceptor: Headers de la requête clonée:', clonedRequest.headers.keys());
    
    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.handleAuthError(error);
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

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
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
        this.afficherFonctionnaliteDesactivee(error.error?.message || error.error?.error);
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
    const maintenant = Date.now();
    if (maintenant - dernierToastFonctionnaliteDesactivee <= 10000) return;
    dernierToastFonctionnaliteDesactivee = maintenant;

    Swal.fire({
      icon: 'warning',
      title: 'Fonctionnalité désactivée',
      text: message || "Cette fonctionnalité est désactivée par le super admin de la boutique. Pour plus d'informations, contactez Maiga Consulting.",
      confirmButtonText: 'Compris',
      confirmButtonColor: '#1a56db'
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