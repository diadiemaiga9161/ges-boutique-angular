import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

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
      this.router.navigate(['/sessions/signin']);
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
      '/v3/api-docs'
    ];
    
    return publicRoutes.some(route => url.includes(route));
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    console.error('❌ Interceptor: Erreur HTTP:', error.status, error.message);
    
    if (error.status === 401 || error.status === 403) {
      // Token expiré ou invalide
      console.log('❌ Interceptor: Token expiré, déconnexion...');
      this.authService.signout();
      this.router.navigate(['/sessions/signin']);
      return throwError(() => new Error('Session expirée. Veuillez vous reconnecter.'));
    }
    
    return throwError(() => error);
  }
}