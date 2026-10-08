import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { filter, map, raceWith, take } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AuthService } from './auth.service';
import { RoleService } from './role.service';

/**
 * Rôles personnalisés : empêche d'ouvrir (par l'adresse) une page que le rôle ne permet
 * pas de voir. Le menu la masque déjà ; le serveur bloque de toute façon les données.
 */
@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivateChild {

  constructor(private auth: AuthService, private roleService: RoleService, private router: Router) {}

  canActivateChild(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    if (!this.auth.isAuthenticated()) return of(true);
    const page = '/' + (state.url.split(/[?#]/)[0].split('/')[1] || '');
    if (page === '/profile') return of(true);

    // On attend les permissions (au plus 4 s : sans réponse, le serveur reste seul juge).
    return this.roleService.charge$.pipe(
      filter(ok => ok),
      raceWith(timer(4000).pipe(map(() => true))),
      take(1),
      map(() => {
        if (this.roleService.peutVoirPage(page)) return true;
        Swal.fire({
          icon: 'info',
          title: 'Accès non autorisé',
          text: `Votre rôle (${this.roleService.roleNom || 'actuel'}) ne permet pas d'ouvrir cette page. Demandez au gérant.`,
          confirmButtonColor: '#2563eb'
        });
        return this.router.parseUrl('/profile');
      })
    );
  }
}
