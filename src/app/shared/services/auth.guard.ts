import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private router: Router,
    private auth: AuthService
  ) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Vérifier si l'utilisateur est authentifié
    if (!this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/sessions/signin');
      return false;
    }

    // Vérifier les rôles si spécifiés dans la route
    const requiredRoles = route.data['roles'] as Array<string>;
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => this.auth.hasRole(role));
      
      if (!hasRequiredRole) {
        // Rediriger vers le dashboard si pas les permissions
        this.router.navigate(['/dashboard']);
        return false;
      }
    }

    return true;
  }
}